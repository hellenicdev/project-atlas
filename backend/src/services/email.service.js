import { Resend } from 'resend';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let resend = null;
if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey);
}

const FROM = 'Project Atlas <onboarding@resend.dev>';

export const sendVerificationEmail = async (email, name, token) => {
  if (!resend) {
    logger.warn(`Resend not configured — skipping verification email to ${email}`);
    return;
  }

  const link = `${env.frontendUrl}/#/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Verify your Project Atlas account',
      html: `
        <h2>Welcome to Project Atlas, ${name}!</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:white;text-decoration:none;border-radius:6px;">Verify Email</a>
        <p>Or paste this in your browser: ${link}</p>
      `,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send verification email to ${email}:`, err.message);
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  if (!resend) {
    logger.warn(`Resend not configured — skipping password reset email to ${email}`);
    return;
  }

  const link = `${env.frontendUrl}/#/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Reset your Project Atlas password',
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${name}, click the link to reset your password:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#6c5ce7;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send password reset email to ${email}:`, err.message);
  }
};
