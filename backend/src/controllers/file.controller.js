import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as fileService from '../services/file.service.js';

export const uploadFile = asyncHandler(async (req, res) => {
  const file = await fileService.uploadFile({ ownerId: req.user.id, file: req.file, folderId: req.body.folderId });
  successResponse(res, { data: file, message: 'File uploaded', statusCode: 201 });
});

export const getFile = asyncHandler(async (req, res) => {
  const file = await fileService.getFile(req.params.id, req.user.id);
  successResponse(res, { data: file });
});

export const deleteFile = asyncHandler(async (req, res) => {
  await fileService.deleteFile(req.params.id, req.user.id);
  successResponse(res, { message: 'File deleted' });
});

export const createFolder = asyncHandler(async (req, res) => {
  const folder = await fileService.createFolder({ ownerId: req.user.id, ...req.body });
  successResponse(res, { data: folder, message: 'Folder created', statusCode: 201 });
});

export const getFolder = asyncHandler(async (req, res) => {
  const result = await fileService.getFolderContents(req.params.id, req.user.id);
  successResponse(res, { data: result });
});

export const getUserFiles = asyncHandler(async (req, res) => {
  const result = await fileService.getUserFiles(req.user.id);
  successResponse(res, { data: result });
});
