import { Router } from 'express';
import { PurchaseController } from '../controllers/PurchaseController';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// POST /purchases - Create purchase
router.post('/', asyncHandler(PurchaseController.create));

// GET /purchases/my - Get user's purchases
router.get('/my', asyncHandler(PurchaseController.getMyPurchases));

// PUT /purchases/:id/confirm - Confirm purchase (admin)
router.put('/:id/confirm', authenticate, requireAdmin, asyncHandler(PurchaseController.confirmPurchase));

export default router;
