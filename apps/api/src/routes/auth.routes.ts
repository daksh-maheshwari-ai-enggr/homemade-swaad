import { Router } from 'express';
import { z } from 'zod';
import {
  sendOtp,
  verifyAndLogin,
  loginWithPassword,
  requestPasswordReset,
  resetPassword,
  type FailureReason,
} from '../auth/auth.service';

const router = Router();

/** Map a service failure reason to a meaningful HTTP status. */
function statusFor(reason: FailureReason | undefined, fallback = 400): number {
  switch (reason) {
    case 'rate-limit':
      return 429;
    case 'email':
      return 502;
    case 'invalid':
      return 401;
    default:
      return fallback;
  }
}

// Validation schemas
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /auth/otp
 * Send OTP to email. Pass name/phone/password to register a new account
 * once the code is verified.
 */
router.post('/otp', async (req, res) => {
  const result = sendOtpSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      message: firstIssue?.message ?? 'Invalid input',
    });
  }

  const { email, phone, name, password } = result.data;
  const otpResult = await sendOtp(email, { phone, name, password });

  if (!otpResult.success) {
    return res.status(statusFor(otpResult.reason, 500)).json(otpResult);
  }

  res.json({ success: true });
});

/**
 * POST /auth/verify-otp
 * Verify OTP and login (creates the account if a registration was pending)
 */
router.post('/verify-otp', async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      message: firstIssue?.message ?? 'Invalid input',
    });
  }

  const { email, code } = result.data;
  const loginResult = await verifyAndLogin(email, code);

  if (!loginResult.success) {
    return res.status(statusFor(loginResult.reason)).json(loginResult);
  }

  res.json({ success: true, token: loginResult.token, user: loginResult.user });
});

/**
 * POST /auth/login
 * Email + password login
 */
router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      message: firstIssue?.message ?? 'Invalid input',
    });
  }

  const { email, password } = result.data;
  const loginResult = await loginWithPassword(email, password);

  if (!loginResult.success) {
    return res.status(statusFor(loginResult.reason)).json(loginResult);
  }

  res.json({ success: true, token: loginResult.token, user: loginResult.user });
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
    return res.status(statusFor(result.reason, 502)).json(result);
  }

  res.json({ success: true });
});

/**
 * POST /auth/password-reset/confirm
 * Confirm password reset with OTP
 */
router.post('/password-reset/confirm', async (req, res) => {
  const result = passwordResetSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      message: firstIssue?.message ?? 'Invalid input',
    });
  }

  const { email, code, newPassword } = result.data;
  const resetResult = await resetPassword(email, code, newPassword);

  if (!resetResult.success) {
    return res.status(statusFor(resetResult.reason)).json(resetResult);
  }

  res.json({ success: true });
});

export default router;
