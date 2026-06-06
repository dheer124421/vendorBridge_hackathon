import express from 'express';
import { createPO, getPOs, getPOById } from '../controllers/poController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('officer'), createPO)
  .get(protect, getPOs);

router.route('/:id')
  .get(protect, getPOById);

export default router;
