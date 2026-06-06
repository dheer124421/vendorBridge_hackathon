import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, payInvoice, sendInvoiceEmail } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('vendor', 'officer'), createInvoice)
  .get(protect, getInvoices);

router.route('/:id')
  .get(protect, getInvoiceById);

router.put('/:id/pay', protect, authorize('officer', 'admin'), payInvoice);
router.post('/:id/email', protect, sendInvoiceEmail);

export default router;
