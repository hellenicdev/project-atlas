import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate, { authorize } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getUsers);
router.post('/ban-user', [
  body('userId').notEmpty().withMessage('User ID is required'),
], validate, adminController.banUser);

router.post('/unban-user', [
  body('userId').notEmpty().withMessage('User ID is required'),
], validate, adminController.unbanUser);

router.get('/logs', adminController.getLogs);
router.get('/stats', adminController.getStats);

export default router;
