import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as userService from '../services/user.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  successResponse(res, { data: result });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  successResponse(res, { data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  successResponse(res, { data: user, message: 'User updated' });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  successResponse(res, { message: 'User deleted' });
});

export const followUser = asyncHandler(async (req, res) => {
  const result = await userService.followUser(req.user.id, req.params.id);
  successResponse(res, { data: result, message: 'Followed' });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const result = await userService.unfollowUser(req.user.id, req.params.id);
  successResponse(res, { data: result, message: 'Unfollowed' });
});

export const getUserActivity = asyncHandler(async (req, res) => {
  const result = await userService.getUserActivity(req.params.id);
  successResponse(res, { data: result });
});
