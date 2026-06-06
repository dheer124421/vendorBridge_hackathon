import express from 'express';
import { createRFQ, getRFQs, getRFQById } from '../controllers/rfqController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('officer'), createRFQ)
  .get(protect, getRFQs);

router.route('/:id')
  .get(protect, getRFQById);

export default router;
