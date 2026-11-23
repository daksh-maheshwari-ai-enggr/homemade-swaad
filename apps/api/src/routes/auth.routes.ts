import { Router } from 'express';
import { z } from 'zod';
import {
  sendOtp,
  verifyAndLogin,
  requestPasswordReset,
  resetPassword,
} from '../auth/auth.service';

const router = Router();

// Validation schemas
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /auth/otp
 * Send OTP to email
 */
router.post('/otp', async (req, res) => {
  const result = sendOtpSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  const email = result.data.email;
  const result2 = await sendOtp(email);

  if (!result2.success) {
    return res.status(429).json(result2);
  }

  res.json({ success: true });
});

/**
 * POST /auth/verify-otp
 * Verify OTP and login
 */
router.post('/verify-otp', async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }

  const { email, code } = result.data;
  const result2 = await verifyAndLogin(email, code);

  if (!result2.success) {
    return res.status(401).json(result2);
  }

  res.json({ success: true, token: result2.token });
});

/**
 * POST /auth/password-reset
 * Request password reset OTP
 */
router.post('/password-reset', async (req, res) => {
  const { email } = req.body;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid email' });
  }

  const result = await requestPasswordReset(email);
  
  if (!result.success) {
    return res.status(429).json(result);
  }

  res.json({ success: true });
});

/**
 * POST /auth/password-reset/confirm
 * Confirm password reset with OTP
 */
router.post('/password-reset/confirm', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  const result = await resetPassword(email, code, newPassword);

  if (!result.success) {
    return res.status(401).json(result);
  }

  res.json({ success: true });
});

export default router;