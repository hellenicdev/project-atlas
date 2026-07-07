import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import env from '../config/env.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const turnstileValidation = env.turnstileSecretKey
  ? [body('turnstileToken').notEmpty().withMessage('Turnstile verification is required')]
  : [];

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ...turnstileValidation,
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  ...turnstileValidation,
], validate, authController.login);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);

router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required'),
], validate, authController.verifyEmail);

router.post('/resend-verification', authenticate, authController.resendVerification);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, authController.resetPassword);

export default router;
