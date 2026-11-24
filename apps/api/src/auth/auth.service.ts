import { randomInt, randomUUID } from 'crypto';
import { redis } from '../utils/redisClient';
import { sendOtpEmail, sendPasswordResetOtp } from '../utils/emailService';
import { rateLimit, resetRateLimit } from '../utils/rateLimiter';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

/** Shape sent to the client (JWT payload / auth state). */
export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape stored in Redis. Accounts live in Redis (not process memory) so they
 * survive `ts-node-dev` restarts. Swap this for Prisma when the DB is wired up.
 */
interface StoredUser extends AuthUser {
  passwordHash?: string;
}

interface PendingRegistration {
  name?: string;
  phone?: string;
  passwordHash?: string;
}

export type FailureReason = 'rate-limit' | 'email' | 'invalid';

type Result<T = object> = {
  success: boolean;
  message?: string;
  /** Lets the route pick a meaningful HTTP status. */
  reason?: FailureReason;
} & Partial<T>;

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const PENDING_EXPIRY_SECONDS = 15 * 60; // 15 minutes to finish signing up
const USER_KEY_PREFIX = 'user:';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const otpKey = (email: string) => `otp:${normalizeEmail(email)}`;
const pendingKey = (email: string) => `pending-registration:${normalizeEmail(email)}`;
const userKey = (email: string) => `${USER_KEY_PREFIX}${normalizeEmail(email)}`;

/** Generate a secure OTP */
function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

function toPublicUser(user: StoredUser): AuthUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

async function findUser(email: string): Promise<StoredUser | null> {
  const raw = await redis.get(userKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

async function saveUser(user: StoredUser): Promise<void> {
  await redis.set(userKey(user.email), JSON.stringify(user));
}

function signToken(user: StoredUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

/** Store OTP in Redis with TTL. The key passed in is used verbatim. */
async function storeOtp(key: string, otp: string, ttlSeconds = OTP_EXPIRY_SECONDS): Promise<void> {
  await redis.setEx(key, ttlSeconds, otp);
}

/** Verify and consume OTP. The key passed in is used verbatim. */
async function consumeOtp(key: string, otp: string): Promise<boolean> {
  const storedOtp = await redis.get(key);
  if (!storedOtp) return false;

  const isValid = storedOtp.trim() === otp.trim();
  if (isValid) {
    await redis.del(key);
  }
  return isValid;
}

/**
 * Send an OTP for login, and optionally remember the details the user typed on the
 * register form so the account can be created once the code is verified.
 */
export async function sendOtp(
  email: string,
  profile?: { name?: string; phone?: string; password?: string }
): Promise<Result> {
  const key = normalizeEmail(email);

  const isAllowed = await rateLimit(key);
  if (!isAllowed) {
    return { success: false, reason: 'rate-limit', message: 'Too many attempts. Please wait before trying again.' };
  }

  const otp = generateOtp();
  await storeOtp(otpKey(email), otp);

  if (profile && (profile.password || profile.name || profile.phone)) {
    const pending: PendingRegistration = {
      name: profile.name,
      phone: profile.phone,
      // Hash before caching so the raw password never sits in Redis.
      passwordHash: profile.password ? await bcrypt.hash(profile.password, 10) : undefined,
    };
    await redis.setEx(pendingKey(email), PENDING_EXPIRY_SECONDS, JSON.stringify(pending));
  }

  const emailSent = await sendOtpEmail(email, otp);

  if (!emailSent) {
    return { success: false, reason: 'email', message: 'Failed to send email. Please try again.' };
  }

  return { success: true };
}

/**
 * Verify OTP, create the account if there is a pending registration, and return a JWT.
 */
export async function verifyAndLogin(
  email: string,
  otp: string
): Promise<Result<{ token: string; user: AuthUser }>> {
  const isValid = await consumeOtp(otpKey(email), otp);

  if (!isValid) {
    return { success: false, reason: 'invalid', message: 'Invalid or expired OTP' };
  }

  resetRateLimit(normalizeEmail(email));

  let user = await findUser(email);
  const pendingRaw = await redis.get(pendingKey(email));

  if (pendingRaw) {
    let pending: PendingRegistration = {};
    try {
      pending = JSON.parse(pendingRaw) as PendingRegistration;
    } catch {
      pending = {};
    }

    if (user) {
      // Existing account: only fill in details that are still missing.
      user.name = user.name ?? pending.name;
      user.phone = user.phone ?? pending.phone;
      user.updatedAt = new Date().toISOString();
    } else {
      const now = new Date().toISOString();
      user = {
        id: randomUUID(),
        email: normalizeEmail(email),
        phone: pending.phone ?? '',
        name: pending.name,
        role: 'CUSTOMER',
        passwordHash: pending.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
    }

    await saveUser(user);
    await redis.del(pendingKey(email));
  }

  // First-time OTP login without a registration form.
  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: randomUUID(),
      email: normalizeEmail(email),
      role: 'CUSTOMER',
      createdAt: now,
      updatedAt: now,
    };
    await saveUser(user);
  }

  return { success: true, token: signToken(user), user: toPublicUser(user) };
}

/**
 * Email + password login.
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<Result<{ token: string; user: AuthUser }>> {
  const key = normalizeEmail(email);

  const isAllowed = await rateLimit(key);
  if (!isAllowed) {
    return { success: false, reason: 'rate-limit', message: 'Too many attempts. Please wait before trying again.' };
  }

  const user = await findUser(email);

  // Same generic message for unknown email and wrong password.
  if (!user?.passwordHash) {
    return { success: false, reason: 'invalid', message: 'Invalid email or password' };
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return { success: false, reason: 'invalid', message: 'Invalid email or password' };
  }

  resetRateLimit(key);
  return { success: true, token: signToken(user), user: toPublicUser(user) };
}

/** Request password reset - sends OTP to email */
export async function requestPasswordReset(email: string): Promise<Result> {
  const key = normalizeEmail(email);

  const isAllowed = await rateLimit(key);
  if (!isAllowed) {
    return { success: false, reason: 'rate-limit', message: 'Too many attempts. Please wait before trying again.' };
  }

  // Don't reveal whether the account exists.
  if (!(await findUser(email))) {
    return { success: true };
  }

  const otp = generateOtp();
  await storeOtp(`password-reset:${key}`, otp);

  const emailSent = await sendPasswordResetOtp(email, otp);

  if (!emailSent) {
    return { success: false, reason: 'email', message: 'Failed to send email' };
  }

  return { success: true };
}

/** Reset password using OTP */
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<Result> {
  const key = normalizeEmail(email);
  const isValid = await consumeOtp(`password-reset:${key}`, otp);

  if (!isValid) {
    return { success: false, reason: 'invalid', message: 'Invalid or expired OTP' };
  }

  const user = await findUser(email);
  if (!user) {
    return { success: false, reason: 'invalid', message: 'No account found for this email' };
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  await saveUser(user);

  resetRateLimit(key);
  return { success: true };
}
