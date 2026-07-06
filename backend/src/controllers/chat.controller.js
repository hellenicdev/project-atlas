import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as chatService from '../services/chat.service.js';

export const getChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getChats(req.user.id);
  successResponse(res, { data: chats });
});

export const createChat = asyncHandler(async (req, res) => {
  const chat = await chatService.createChat({ ...req.body, participants: [...req.body.participants, req.user.id] });
  successResponse(res, { data: chat, message: 'Chat created', statusCode: 201 });
});

export const getMessages = asyncHandler(async (req, res) => {
  const result = await chatService.getMessages(req.params.id, req.user.id, req.query);
  successResponse(res, { data: result });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage({
    chatId: req.params.id,
    senderId: req.user.id,
    ...req.body,
  });

  const io = req.app.get('io');
  if (io) {
    io.of('/chat').to(`chat:${req.params.id}`).emit('chat:message', message);
  }

  successResponse(res, { data: message, message: 'Message sent', statusCode: 201 });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await chatService.deleteMessage(req.params.messageId, req.user.id);
  successResponse(res, { message: 'Message deleted' });
});
