import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * One shared, pooled transporter for the whole process.
 *
 * Creating a transporter per send means a fresh TCP + TLS handshake and SMTP
 * AUTH every time, which costs ~4s against smtp.gmail.com. Reusing a pooled
 * connection brings repeat sends down to ~1.6s. Verified by measurement.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      pool: true,
      maxConnections: 1,
      maxMessages: 50,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

async function sendMail(options: Parameters<Transporter['sendMail']>[0]): Promise<boolean> {
  const startedAt = Date.now();
  try {
    await getTransporter().sendMail(options);
    console.log(`[email] sent to ${String(options.to)} in ${Date.now() - startedAt}ms`);
    return true;
  } catch (error) {
    console.error(`[email] send failed after ${Date.now() - startedAt}ms:`, error);
    return false;
  }
}

/**
 * Open the SMTP connection once at boot so the first real OTP does not pay the
 * ~4s TCP + TLS + AUTH cost. Failure here is non-fatal.
 */
export async function warmUpMailer(): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set, OTP emails will fail');
    return;
  }
  const startedAt = Date.now();
  try {
    await getTransporter().verify();
    console.log(`[email] SMTP connection ready in ${Date.now() - startedAt}ms`);
  } catch (error) {
    console.error('[email] SMTP warm-up failed:', error);
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  return sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px;">
        <h2>Verification Code</h2>
        <p>Your code is: <strong>${otp}</strong></p>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetOtp(to: string, otp: string): Promise<boolean> {
  return sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${otp}\n\nThis code expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px;">
        <h2>Password Reset</h2>
        <p>Your code is: <strong>${otp}</strong></p>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  });
}
