import { User } from '../models/index.js';

export const findById = (id) => User.findById(id);
export const findOne = (filter) => User.findOne(filter);
export const create = (data) => User.create(data);
export const update = (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const remove = (id) => User.findByIdAndDelete(id);
export const count = (filter) => User.countDocuments(filter);
