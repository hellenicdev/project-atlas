import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.post('/read', authenticate, notificationController.markAsRead);
router.post('/read-all', authenticate, notificationController.markAllAsRead);

export default router;
