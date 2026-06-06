import express from 'express';
import { getVendors, updateVendorStatus, getVendorStats } from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'officer'), getVendors);
router.get('/stats', protect, authorize('admin', 'officer'), getVendorStats);
router.put('/:id/status', protect, authorize('admin'), updateVendorStatus);

export default router;
