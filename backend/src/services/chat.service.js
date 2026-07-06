import { Chat, Message } from '../models/index.js';
import { AppError } from '../utils/response.js';

export const getChats = async (userId) => {
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name avatar')
    .sort({ updatedAt: -1 });
  return chats;
};

export const createChat = async ({ type, name, participants }) => {
  if (type === 'private') {
    const existing = await Chat.findOne({
      type: 'private',
      participants: { $all: participants, $size: 2 },
    });
    if (existing) return existing;
  }

  const chat = await Chat.create({ type, name, participants });
  return chat.populate('participants', 'name avatar');
};

export const getMessages = async (chatId, userId, { page = 1, limit = 50 }) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
  if (!chat.participants.some((p) => p.toString() === userId)) {
    throw new AppError('Not a participant', 403, 'AUTH_FORBIDDEN');
  }

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ chatId, isDeleted: false })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chatId, isDeleted: false }),
  ]);

  return { messages: messages.reverse(), total, page, totalPages: Math.ceil(total / limit) };
};

export const sendMessage = async ({ chatId, senderId, content, type = 'text' }) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new AppError('Chat not found', 404, 'CHAT_NOT_FOUND');
  if (!chat.participants.some((p) => p.toString() === senderId)) {
    throw new AppError('Not a participant', 403, 'AUTH_FORBIDDEN');
  }

  const message = await Message.create({ chatId, senderId, content, type });

  chat.lastMessage = { content, senderId, createdAt: new Date() };
  await chat.save();

  return message.populate('senderId', 'name avatar');
};

export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  if (message.senderId.toString() !== userId) {
    throw new AppError('Not authorized', 403, 'AUTH_FORBIDDEN');
  }
  message.isDeleted = true;
  await message.save();
};
