import express from 'express';
import { initiateApproval, getPendingApprovals, getApprovals, processApproval } from '../controllers/approvalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protect, authorize('officer'), initiateApproval);
router.get('/pending', protect, authorize('manager', 'admin'), getPendingApprovals);
router.get('/', protect, authorize('officer', 'manager', 'admin'), getApprovals);
router.put('/:id', protect, authorize('manager'), processApproval);

export default router;
