import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validator.js';
import authenticate from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import * as fileController from '../controllers/file.controller.js';

const router = Router();

router.get('/', authenticate, fileController.getUserFiles);
router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);
router.get('/:id', authenticate, fileController.getFile);
router.delete('/:id', authenticate, fileController.deleteFile);

router.post('/folder', authenticate, [
  body('name').trim().notEmpty().withMessage('Folder name is required'),
], validate, fileController.createFolder);

router.get('/folder/:id', authenticate, fileController.getFolder);

export default router;
