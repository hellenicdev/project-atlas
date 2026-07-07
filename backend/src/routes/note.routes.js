import { Router } from 'express';
import authenticate from '../middleware/auth.js';
import * as noteController from '../controllers/note.controller.js';

const router = Router();

router.get('/', authenticate, noteController.getNotes);
router.post('/', authenticate, noteController.createNote);
router.get('/:id', authenticate, noteController.getNoteById);
router.patch('/:id', authenticate, noteController.updateNote);
router.delete('/:id', authenticate, noteController.deleteNote);

export default router;

