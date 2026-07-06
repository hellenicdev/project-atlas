import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import * as postController from '../controllers/post.controller.js';

const router = Router();

router.get('/', authenticate, postController.getPosts);
router.get('/:id', authenticate, postController.getPostById);

router.post('/', authenticate, [
  body('content').trim().notEmpty().withMessage('Content is required'),
], validate, postController.createPost);

router.delete('/:id', authenticate, postController.deletePost);
router.post('/like/:id', authenticate, postController.likePost);
router.post('/unlike/:id', authenticate, postController.unlikePost);

router.post('/comment/:id', authenticate, [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
], validate, postController.commentOnPost);

router.delete('/comment/:commentId', authenticate, postController.deleteComment);

export default router;
