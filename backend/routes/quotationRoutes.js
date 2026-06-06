import express from 'express';
import { submitQuotation, getQuotationsByRFQ, getVendorQuotations, getQuotationById } from '../controllers/quotationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('vendor'), submitQuotation);

router.get('/rfq/:rfqId', protect, authorize('officer', 'manager', 'admin'), getQuotationsByRFQ);
router.get('/vendor/my', protect, authorize('vendor'), getVendorQuotations);
router.get('/:id', protect, getQuotationById);

export default router;
