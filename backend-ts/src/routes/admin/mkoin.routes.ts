import { Router } from 'express';
import { MkoinController } from '../../controllers/MkoinController';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// POST /admin/mkoin/mint - Mint MKOIN tokens
router.post('/mint', asyncHandler(MkoinController.mint));

// GET /admin/mkoin/balance/:address - Get MKOIN balance for address
router.get('/balance/:address', asyncHandler(MkoinController.getBalance));

// GET /admin/mkoin/total-supply - Get total MKOIN supply
router.get('/total-supply', asyncHandler(MkoinController.getTotalSupply));

// GET /admin/mkoin/history - Get MKOIN mint history
router.get('/history', asyncHandler(MkoinController.getHistory));

// GET /admin/mkoin/wallet/:address - Get MKOIN wallet address for owner
router.get('/wallet/:address', asyncHandler(MkoinController.getWalletAddress));

export default router;
