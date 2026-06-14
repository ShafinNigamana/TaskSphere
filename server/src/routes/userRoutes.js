import express from 'express';
import { getUsers, resetPassword } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, restrictTo('manager'), getUsers);
router.post('/:id/reset-password', protect, restrictTo('manager', 'super_admin'), resetPassword);

export default router;
