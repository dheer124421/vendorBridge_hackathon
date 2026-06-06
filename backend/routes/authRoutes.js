import express from 'express';
import { authUser, registerUser, forgotPassword, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/signup', registerUser);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getUserProfile);

export default router;
