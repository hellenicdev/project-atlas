import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import * as fileController from '../controllers/file.controller.js';

const router = Router();

router.post('/upload', authenticate, fileController.uploadFile);
router.get('/:id', authenticate, fileController.getFile);
router.delete('/:id', authenticate, fileController.deleteFile);

router.post('/folder', authenticate, [
  body('name').trim().notEmpty().withMessage('Folder name is required'),
], validate, fileController.createFolder);

router.get('/folder/:id', authenticate, fileController.getFolder);

export default router;
