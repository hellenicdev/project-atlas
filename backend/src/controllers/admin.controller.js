import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { User } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { getUsers } = await import('../services/user.service.js');
  const result = await getUsers(req.query);
  successResponse(res, { data: result });
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  user.isBlocked = true;
  await user.save();
  successResponse(res, { message: 'User banned' });
});

export const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  user.isBlocked = false;
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  successResponse(res, { message: 'User unbanned' });
});

export const getLogs = asyncHandler(async (req, res) => {
  successResponse(res, { data: { message: 'Logs accessible via server files' } });
});

export const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPosts, totalFiles] = await Promise.all([
    User.countDocuments(),
    import('../models/Post.js').then(m => m.default.countDocuments()),
    import('../models/File.js').then(m => m.default.countDocuments()),
  ]);
  successResponse(res, { data: { totalUsers, totalPosts, totalFiles } });
});
