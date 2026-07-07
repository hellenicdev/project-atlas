import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as noteService from '../services/note.service.js';

export const getNotes = asyncHandler(async (req, res) => {
  const result = await noteService.getNotes(req.user.id, req.query);
  successResponse(res, { data: result });
});

export const getNoteById = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.params.id, req.user.id);
  successResponse(res, { data: note });
});

export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user.id, req.body);
  successResponse(res, { data: note, message: 'Note created', statusCode: 201 });
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.params.id, req.user.id, req.body);
  successResponse(res, { data: note, message: 'Note updated' });
});

export const deleteNote = asyncHandler(async (req, res) => {
  await noteService.deleteNote(req.params.id, req.user.id);
  successResponse(res, { message: 'Note deleted' });
});

