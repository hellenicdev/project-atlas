import { Post } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getPosts = async ({ page = 1, limit = 20, userId, following }) => {
  const query = {};
  if (following && following.length > 0) {
    query.authorId = { $in: following };
  }
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find(query).populate('authorId', 'name avatar').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(query),
  ]);
  return { posts, total, page, totalPages: Math.ceil(total / limit) };
};

export const createPost = async ({ authorId, content, media, tags, mentions }) => {
  const post = await Post.create({ authorId, content, media, tags, mentions });
  return post.populate('authorId', 'name avatar');
};

export const getPostById = async (id) => {
  const post = await Post.findById(id).populate('authorId', 'name avatar');
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  return post;
};

export const deletePost = async (id, userId) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  if (post.authorId.toString() !== userId) {
    throw new AppError('Not authorized', 403, 'AUTH_FORBIDDEN');
  }
  await Post.findByIdAndDelete(id);
};

export const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    await post.save();
  }
  return post;
};

export const unlikePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  post.likes.pull(userId);
  await post.save();
  return post;
};

export const commentOnPost = async (postId, authorId, content) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  post.comments.push({ authorId, content });
  await post.save();
  return post.populate('comments.authorId', 'name avatar');
};

export const deleteComment = async (postId, commentId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  const comment = post.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  if (comment.authorId.toString() !== userId) {
    throw new AppError('Not authorized', 403, 'AUTH_FORBIDDEN');
  }
  comment.deleteOne();
  await post.save();
  return post;
};
