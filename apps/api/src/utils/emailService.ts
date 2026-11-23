import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const mailOptions = {
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
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendPasswordResetOtp(to: string, otp: string): Promise<boolean> {
  const mailOptions = {
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
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}