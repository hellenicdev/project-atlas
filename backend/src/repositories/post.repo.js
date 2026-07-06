import { Post } from '../models/index.js';

export const find = (filter, options) => Post.find(filter).sort({ createdAt: -1 }).skip(options.skip).limit(options.limit);
export const findById = (id) => Post.findById(id);
export const create = (data) => Post.create(data);
export const remove = (id) => Post.findByIdAndDelete(id);
export const count = (filter) => Post.countDocuments(filter);
