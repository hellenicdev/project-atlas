import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as aiService from '../services/ai.service.js';

export const aiChat = asyncHandler(async (req, res) => {
  const result = await aiService.chat(req.user.id, req.body.message);
  successResponse(res, { data: result });
});

export const summarize = asyncHandler(async (req, res) => {
  const response = await aiService.summarize(req.body.text);
  successResponse(res, { data: { response } });
});

export const translate = asyncHandler(async (req, res) => {
  const response = await aiService.translate(req.body.text, req.body.targetLanguage);
  successResponse(res, { data: { response } });
});

export const ocr = asyncHandler(async (req, res) => {
  const response = await aiService.ocr(req.body.image);
  successResponse(res, { data: { response } });
});

export const analyzeFile = asyncHandler(async (req, res) => {
  const response = await aiService.summarize(req.body.content || '');
  successResponse(res, { data: { response } });
});
