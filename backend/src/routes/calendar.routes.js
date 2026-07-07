import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import * as calendarController from '../controllers/calendar.controller.js';

const router = Router();

router.get('/events', authenticate, calendarController.getEvents);
router.post('/events', authenticate, calendarController.createEvent);
router.get('/events/:id', authenticate, calendarController.getEventById);
router.patch('/events/:id', authenticate, calendarController.updateEvent);
router.delete('/events/:id', authenticate, calendarController.deleteEvent);

export default router;

