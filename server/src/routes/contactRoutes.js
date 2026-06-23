import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply general rate limiting to the contact form submissions
router.post('/', generalLimiter, submitContact);

export default router;
