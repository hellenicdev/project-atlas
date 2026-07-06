import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

router.get('/', authenticate, chatController.getChats);
router.post('/', authenticate, [
  body('participants').isArray({ min: 1 }).withMessage('At least one participant required'),
], validate, chatController.createChat);

router.get('/:id/messages', authenticate, chatController.getMessages);
router.post('/:id/messages', authenticate, [
  body('content').trim().notEmpty().withMessage('Message content is required'),
], validate, chatController.sendMessage);

router.delete('/:id/messages/:messageId', authenticate, chatController.deleteMessage);

export default router;
