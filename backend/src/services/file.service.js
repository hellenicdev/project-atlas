import { File, Folder } from '../models/index.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/response.js';

export const uploadFile = async ({ ownerId, file, folderId }) => {
  if (!cloudinary.config().cloud_name) {
    return { url: file.path, originalName: file.originalname, type: file.mimetype, size: file.size };
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: `atlas/${ownerId}`,
    resource_type: 'auto',
  });

  const fileDoc = await File.create({
    ownerId,
    originalName: file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    type: file.mimetype,
    size: file.size,
    folderId: folderId || null,
  });

  return fileDoc;
};

export const getFile = async (id, userId) => {
  const file = await File.findOne({ _id: id, ownerId: userId });
  if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
  return file;
};

export const deleteFile = async (id, userId) => {
  const file = await File.findOne({ _id: id, ownerId: userId });
  if (!file) throw new AppError('File not found', 404, 'FILE_NOT_FOUND');

  if (cloudinary.config().cloud_name && file.publicId) {
    await cloudinary.uploader.destroy(file.publicId);
  }

  await File.findByIdAndDelete(id);
};

export const createFolder = async ({ ownerId, name, parentId }) => {
  const folder = await Folder.create({ ownerId, name, parentId: parentId || null });
  return folder;
};

export const getFolderContents = async (folderId, userId) => {
  const folder = await Folder.findOne({ _id: folderId, ownerId: userId });
  if (!folder) throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');

  const [files, folders] = await Promise.all([
    File.find({ ownerId: userId, folderId, isTrashed: false }),
    Folder.find({ ownerId: userId, parentId: folderId }),
  ]);

  return { folder, files, folders };
};

export const getUserFiles = async (userId) => {
  const files = await File.find({ ownerId: userId, folderId: null, isTrashed: false }).sort({ createdAt: -1 });
  const folders = await Folder.find({ ownerId: userId, parentId: null });
  return { files, folders };
};
