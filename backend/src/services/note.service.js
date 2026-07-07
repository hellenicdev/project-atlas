import { Note } from '../models/index.js';
import { AppError } from '../utils/response.js';

const buildSearchQuery = (search) => {
  if (!search) return {};
  return {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ],
  };
};

export const getNotes = async (ownerId, { search, pinned, limit = 100 } = {}) => {
  const query = { ownerId, ...buildSearchQuery(search) };
  if (pinned === 'true' || pinned === true) {
    query.pinned = true;
  }

  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 100, 200));
  const notes = await Note.find(query)
    .sort({ pinned: -1, updatedAt: -1 })
    .limit(parsedLimit);

  return { notes, total: notes.length };
};

export const getNoteById = async (id, ownerId) => {
  const note = await Note.findOne({ _id: id, ownerId });
  if (!note) throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
  return note;
};

export const createNote = async (ownerId, data = {}) => {
  const note = await Note.create({
    ownerId,
    title: data.title?.trim() || 'Untitled',
    content: data.content ?? '',
    color: data.color || '#7c6cf7',
    pinned: Boolean(data.pinned),
    tags: Array.isArray(data.tags) ? data.tags : [],
  });

  return note;
};

export const updateNote = async (id, ownerId, updates = {}) => {
  const note = await Note.findOne({ _id: id, ownerId });
  if (!note) throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');

  if (updates.title !== undefined) note.title = updates.title.trim() || 'Untitled';
  if (updates.content !== undefined) note.content = updates.content;
  if (updates.color !== undefined) note.color = updates.color;
  if (updates.pinned !== undefined) note.pinned = updates.pinned === true || updates.pinned === 'true' || updates.pinned === 1 || updates.pinned === '1';
  if (updates.tags !== undefined) {
    note.tags = Array.isArray(updates.tags) ? updates.tags : [];
  }

  await note.save();
  return note;
};

export const deleteNote = async (id, ownerId) => {
  const note = await Note.findOne({ _id: id, ownerId });
  if (!note) throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
  await Note.deleteOne({ _id: id, ownerId });
};

