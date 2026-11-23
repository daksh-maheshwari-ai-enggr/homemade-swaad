import { randomInt } from 'crypto';
import { redis } from '../utils/redisClient';
import { sendOtpEmail, sendPasswordResetOtp } from '../utils/emailService';
import { rateLimit, resetRateLimit } from '../utils/rateLimiter';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Simple in-memory user store for development (replace with Prisma in production)
interface User {
  id: string;
  phone: string;
  email: string;
  name?: string;
  password?: string;
  role?: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

const users: Record<string, User> = {};
let userIdCounter = 1;

// OTP generation
const OTP_LENGTH = 6;
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate a secure OTP
 */
function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Store OTP in Redis with TTL
 */
async function storeOtp(key: string, otp: string): Promise<void> {
  await redis.setEx(`otp:${key}`, OTP_EXPIRY / 1000, otp);
}

/**
 * Verify and consume OTP
 */
async function verifyOtp(key: string, otp: string): Promise<boolean> {
  const storedOtp = await redis.get(`otp:${key}`);
  if (!storedOtp) return false;
  
  const isValid = storedOtp === otp;
  if (isValid) {
    await redis.del(`otp:${key}`);
  }
  return isValid;
}

/**
 * Send OTP to email with rate limiting
 */
export async function sendOtp(email: string): Promise<{ success: boolean; message?: string }> {
  // Check rate limit
  const isAllowed = await rateLimit(email);
  if (!isAllowed) {
    return { success: false, message: 'Too many attempts. Please wait before trying again.' };
  }

  const otp = generateOtp();
  await storeOtp(email, otp);
  
  const emailSent = await sendOtpEmail(email, otp);
  
  if (!emailSent) {
    return { success: false, message: 'Failed to send email. Please try again.' };
  }

  return { success: true };
}

/**
 * Verify OTP and return JWT token
 */
export async function verifyAndLogin(
  email: string, 
  otp: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  const isValid = await verifyOtp(`otp:${email}`, otp);
  
  if (!isValid) {
    return { success: false, message: 'Invalid or expired OTP' };
  }

  // Reset rate limit after successful verification
  resetRateLimit(email);

  // Generate JWT token
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return { success: true, token };
}

/**
 * Request password reset - sends OTP to email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  // Check rate limit
  const isAllowed = await rateLimit(email);
  if (!isAllowed) {
    return { success: false, message: 'Too many attempts. Please wait before trying again.' };
  }

  // Check if user exists (for demo, we'll say success regardless)
  if (!users[email]) {
    // Don't reveal if user exists or not - fake delay
    return { success: true };
  }

  const otp = generateOtp();
  await storeOtp(`password-reset:${email}`, otp);
  
  const emailSent = await sendPasswordResetOtp(email, otp);
  
  if (!emailSent) {
    return { success: false, message: 'Failed to send email' };
  }

  return { success: true };
}

/**
 * Reset password using OTP
 */
export async function resetPassword(
  email: string, 
  otp: string, 
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const isValid = await verifyOtp(`password-reset:${email}`, otp);
  
  if (!isValid) {
    return { success: false, message: 'Invalid or expired OTP' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password (in-memory for now)
  if (users[email]) {
    users[email].password = hashedPassword;
  }

  return { success: true };
}

/**
 * Register user with phone/email (for OTP login)
 */
export async function registerOrLogin(
  phone: string,
  email: string,
  fullName: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  let user = users[phone] || Object.values(users).find(u => u.phone === phone);
  
  if (!user) {
    const id = `user_${userIdCounter++}`;
    user = { id, phone, email, name: fullName, role: 'CUSTOMER' };
    users[phone] = user;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return { success: true, token };
}