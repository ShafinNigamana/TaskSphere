import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  uploadAttachment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import commentRoutes from './commentRoutes.js';

const router = express.Router();

// Apply protect middleware to all task routes
router.use(protect);

// Nest comments under tasks
router.use('/:taskId/comments', commentRoutes);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

// Attachments route
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

export default router;