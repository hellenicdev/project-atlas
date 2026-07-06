import { User } from '../models/index.js';
import redis from '../config/redis.js';
import { AppError } from '../utils/response.js';

export const getUsers = async ({ page = 1, limit = 20, search }) => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const getUserById = async (id) => {
  const cacheKey = `user:${id}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (redis) {
    await redis.setex(cacheKey, 600, JSON.stringify(user));
  }
  return user;
};

export const updateUser = async (id, updates) => {
  const allowed = ['name', 'bio', 'avatar'];
  const data = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) data[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (redis) await redis.del(`user:${id}`);
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (redis) await redis.del(`user:${id}`);
};

export const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new AppError('Cannot follow yourself', 400, 'VALIDATION_ERROR');
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  if (currentUser.following.includes(targetUserId)) {
    throw new AppError('Already following', 409, 'ALREADY_FOLLOWING');
  }

  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);

  await Promise.all([currentUser.save(), targetUser.save()]);

  if (redis) {
    await redis.del(`user:${currentUserId}`);
    await redis.del(`user:${targetUserId}`);
  }

  return { follower: currentUserId, following: targetUserId };
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  currentUser.following.pull(targetUserId);
  targetUser.followers.pull(currentUserId);

  await Promise.all([currentUser.save(), targetUser.save()]);

  if (redis) {
    await redis.del(`user:${currentUserId}`);
    await redis.del(`user:${targetUserId}`);
  }

  return { follower: currentUserId, following: targetUserId };
};

export const getUserActivity = async (id) => {
  const { Post } = await import('../models/index.js');
  const [posts, likes, comments] = await Promise.all([
    Post.find({ authorId: id }).sort({ createdAt: -1 }).limit(20),
    Post.countDocuments({ likes: id }),
    Post.countDocuments({ 'comments.authorId': id }),
  ]);
  return { posts, totalLikes: likes, totalComments: comments };
};
