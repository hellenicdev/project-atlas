import { File } from '../models/index.js';

export const findById = (id) => File.findById(id);
export const findOne = (filter) => File.findOne(filter);
export const create = (data) => File.create(data);
export const remove = (id) => File.findByIdAndDelete(id);
export const findByOwner = (ownerId, folderId) => File.find({ ownerId, folderId, isTrashed: false });
