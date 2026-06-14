import express from 'express';
import { createComment, getCommentsByTask } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post('/', createComment);
router.get('/', getCommentsByTask);

export default router;
