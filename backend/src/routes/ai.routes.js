import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.post('/chat', authenticate, [
  body('message').trim().notEmpty().withMessage('Message is required'),
], validate, aiController.aiChat);

router.post('/summarize', authenticate, [
  body('text').trim().notEmpty().withMessage('Text is required'),
], validate, aiController.summarize);

router.post('/translate', authenticate, [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('targetLanguage').trim().notEmpty().withMessage('Target language is required'),
], validate, aiController.translate);

router.post('/ocr', authenticate, aiController.ocr);
router.post('/analyze-file', authenticate, aiController.analyzeFile);

export default router;
