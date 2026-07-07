import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/env.js';
import { User } from '../models/index.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/response.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyTurnstileToken = async (token) => {
  if (!env.turnstileSecretKey) {
    return;
  }

  if (!token) {
    throw new AppError('Turnstile verification is required', 400, 'TURNSTILE_REQUIRED');
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    throw new AppError('Turnstile verification failed', 502, 'TURNSTILE_VERIFY_FAILED');
  }

  const result = await response.json();
  if (!result.success) {
    const errorCodes = Array.isArray(result['error-codes']) && result['error-codes'].length > 0
      ? ` (${result['error-codes'].join(', ')})`
      : '';
    throw new AppError(`Turnstile verification failed${errorCodes}`, 400, 'TURNSTILE_INVALID');
  }
};

export const createUser = async ({ name, email, password, turnstileToken }) => {
  await verifyTurnstileToken(turnstileToken);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409, 'AUTH_EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = uuidv4();

  const user = await User.create({ name, email, passwordHash, verificationToken });

  await sendVerificationEmail(email, name, verificationToken);

  return { user: sanitizeUser(user), verificationToken };
};

export const authenticateUser = async ({ email, password, turnstileToken }) => {
  await verifyTurnstileToken(turnstileToken);

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  if (user.isBlocked) {
    throw new AppError('Account is blocked', 403, 'AUTH_BLOCKED');
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('Account is temporarily locked', 423, 'AUTH_LOCKED');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  if (redis) {
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
  }

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    if (redis) {
      const stored = await redis.get(`refresh:${user.id}`);
      if (stored !== token) {
        throw new AppError('Invalid refresh token', 401, 'AUTH_INVALID_TOKEN');
      }
    }

    const accessToken = generateAccessToken(user);
    return { accessToken, user: sanitizeUser(user) };
  } catch (error) {
    if (error.isOperational) throw error;
    throw new AppError('Invalid refresh token', 401, 'AUTH_INVALID_TOKEN');
  }
};

export const verifyUserEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) throw new AppError('Invalid or expired verification token', 400, 'AUTH_INVALID_TOKEN');

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  return sanitizeUser(user);
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether the email exists
    return;
  }

  const resetToken = uuidv4();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  await sendPasswordResetEmail(email, user.name, resetToken);
};

export const resetUserPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400, 'AUTH_INVALID_TOKEN');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  return sanitizeUser(user);
};

export const logoutUser = async (userId) => {
  if (redis) {
    await redis.del(`refresh:${userId}`);
  }
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    env.jwtSecret,
    { expiresIn: env.refreshTokenExpiresIn },
  );
};

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.__v;
  return obj;
};
