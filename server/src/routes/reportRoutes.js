import express from 'express';
import { getReportMetrics, exportReportMetrics } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', protect, restrictTo('manager'), getReportMetrics);
router.get('/export', protect, restrictTo('manager'), exportReportMetrics);

export default router;
