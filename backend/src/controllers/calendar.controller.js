import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import * as calendarService from '../services/calendar.service.js';

export const getEvents = asyncHandler(async (req, res) => {
  const result = await calendarService.getEvents(req.user.id, req.query);
  successResponse(res, { data: result });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await calendarService.getEventById(req.params.id, req.user.id);
  successResponse(res, { data: event });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.createEvent(req.user.id, req.body);
  successResponse(res, { data: event, message: 'Event created', statusCode: 201 });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.updateEvent(req.params.id, req.user.id, req.body);
  successResponse(res, { data: event, message: 'Event updated' });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await calendarService.deleteEvent(req.params.id, req.user.id);
  successResponse(res, { message: 'Event deleted' });
});

