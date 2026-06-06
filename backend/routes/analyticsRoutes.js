import express from 'express';
import { getDashboardAnalytics, getActivityLogs } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/logs', protect, authorize('admin', 'officer'), getActivityLogs);

export default router;
