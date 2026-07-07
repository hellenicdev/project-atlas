import { CalendarEvent } from '../models/index.js';
import { AppError } from '../utils/response.js';

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1' || value === 'on';
const parseNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getEvents = async (ownerId, { search, from, to, limit = 200 } = {}) => {
  const query = { ownerId };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (fromDate || toDate) {
    query.startAt = {};
    if (fromDate) query.startAt.$gte = fromDate;
    if (toDate) query.startAt.$lte = toDate;
  }

  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 200, 500));
  const events = await CalendarEvent.find(query)
    .sort({ startAt: 1, updatedAt: -1 })
    .limit(parsedLimit);

  return { events, total: events.length };
};

export const getEventById = async (id, ownerId) => {
  const event = await CalendarEvent.findOne({ _id: id, ownerId });
  if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  return event;
};

export const createEvent = async (ownerId, data = {}) => {
  const startAt = parseDate(data.startAt);
  if (!startAt) throw new AppError('Valid start time is required', 400, 'VALIDATION_ERROR');

  const endAt = parseDate(data.endAt);
  const event = await CalendarEvent.create({
    ownerId,
    title: data.title?.trim() || 'Untitled event',
    description: data.description ?? '',
    location: data.location ?? '',
    startAt,
    endAt,
    allDay: parseBoolean(data.allDay),
    color: data.color || '#7c6cf7',
    reminderMinutes: parseNumberOrNull(data.reminderMinutes),
  });

  return event;
};

export const updateEvent = async (id, ownerId, updates = {}) => {
  const event = await CalendarEvent.findOne({ _id: id, ownerId });
  if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

  if (updates.title !== undefined) event.title = updates.title.trim() || 'Untitled event';
  if (updates.description !== undefined) event.description = updates.description;
  if (updates.location !== undefined) event.location = updates.location;
  if (updates.startAt !== undefined) {
    const startAt = parseDate(updates.startAt);
    if (!startAt) throw new AppError('Valid start time is required', 400, 'VALIDATION_ERROR');
    event.startAt = startAt;
  }
  if (updates.endAt !== undefined) event.endAt = parseDate(updates.endAt);
  if (updates.allDay !== undefined) event.allDay = parseBoolean(updates.allDay);
  if (updates.color !== undefined) event.color = updates.color;
  if (updates.reminderMinutes !== undefined) {
    event.reminderMinutes = parseNumberOrNull(updates.reminderMinutes);
  }

  await event.save();
  return event;
};

export const deleteEvent = async (id, ownerId) => {
  const event = await CalendarEvent.findOne({ _id: id, ownerId });
  if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  await CalendarEvent.deleteOne({ _id: id, ownerId });
};
