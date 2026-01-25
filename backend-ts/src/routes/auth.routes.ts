import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// POST /auth/login - Username/password login
router.post('/login', asyncHandler(AuthController.login));

// POST /auth/wallet - Wallet address login
router.post('/wallet', asyncHandler(AuthController.walletLogin));

// GET /auth/me - Get current user (requires auth)
router.get('/me', authenticate, asyncHandler(AuthController.me));

export default router;
