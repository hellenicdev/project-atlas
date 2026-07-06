import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.createUser(req.body);
  successResponse(res, { data: result.user, message: 'Registration successful. Verify your email.', statusCode: 201 });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.authenticateUser(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  successResponse(res, {
    data: { user: result.user, accessToken: result.accessToken },
    message: 'Login successful',
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id);
  res.clearCookie('refreshToken');
  successResponse(res, { message: 'Logged out' });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(token);
  successResponse(res, { data: result, message: 'Token refreshed' });
});

export const getMe = asyncHandler(async (req, res) => {
  const { getUserById } = await import('../services/user.service.js');
  const user = await getUserById(req.user.id);
  successResponse(res, { data: user });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyUserEmail(req.body.token);
  successResponse(res, { data: user, message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { User } = await import('../models/index.js');
  const user = await User.findById(req.user.id);
  if (user && !user.isVerified) {
    const { sendVerificationEmail } = await import('../services/email.service.js');
    const token = user.verificationToken || (await import('uuid')).v4();
    if (!user.verificationToken) {
      user.verificationToken = token;
      await user.save();
    }
    await sendVerificationEmail(user.email, user.name, token);
  }
  successResponse(res, { message: 'Verification email sent' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  successResponse(res, { message: 'If email exists, reset link sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetUserPassword(req.body.token, req.body.password);
  successResponse(res, { message: 'Password reset successful' });
});
