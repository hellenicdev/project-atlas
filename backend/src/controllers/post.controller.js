import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as postService from '../services/post.service.js';

export const getPosts = asyncHandler(async (req, res) => {
  const { getUsers } = await import('../services/user.service.js');
  const result = await postService.getPosts(req.query);
  successResponse(res, { data: result });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost({ authorId: req.user.id, ...req.body });
  successResponse(res, { data: post, message: 'Post created', statusCode: 201 });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  successResponse(res, { data: post });
});

export const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user.id);
  successResponse(res, { message: 'Post deleted' });
});

export const likePost = asyncHandler(async (req, res) => {
  const post = await postService.likePost(req.params.id, req.user.id);
  successResponse(res, { data: post, message: 'Liked' });
});

export const unlikePost = asyncHandler(async (req, res) => {
  const post = await postService.unlikePost(req.params.id, req.user.id);
  successResponse(res, { data: post, message: 'Unliked' });
});

export const commentOnPost = asyncHandler(async (req, res) => {
  const post = await postService.commentOnPost(req.params.id, req.user.id, req.body.content);
  successResponse(res, { data: post, message: 'Comment added' });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const post = await postService.deleteComment(req.params.id, req.params.commentId, req.user.id);
  successResponse(res, { data: post, message: 'Comment deleted' });
});
