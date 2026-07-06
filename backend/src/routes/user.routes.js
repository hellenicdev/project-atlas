import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.get('/:id/activity', authenticate, userController.getUserActivity);

router.patch('/:id', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().trim().isLength({ max: 500 }),
], validate, userController.updateUser);

router.delete('/:id', authenticate, userController.deleteUser);
router.post('/follow/:id', authenticate, userController.followUser);
router.post('/unfollow/:id', authenticate, userController.unfollowUser);

export default router;
