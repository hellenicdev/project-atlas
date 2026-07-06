import { Message } from '../models/index.js';

export const findByChat = (chatId, options) => Message.find({ chatId, isDeleted: false }).sort({ createdAt: -1 }).skip(options.skip).limit(options.limit);
export const create = (data) => Message.create(data);
export const findById = (id) => Message.findById(id);
export const count = (chatId) => Message.countDocuments({ chatId, isDeleted: false });
