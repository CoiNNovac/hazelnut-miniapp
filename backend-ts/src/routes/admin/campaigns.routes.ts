import { Router } from 'express';
import { CampaignController } from '../../controllers/CampaignController';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { requireAdmin, requireFarmer } from '../../middleware/admin.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

const router = Router();

// GET /campaigns - List campaigns (public with optional filtering)
router.get('/', optionalAuth, asyncHandler(CampaignController.list));

// GET /campaigns/:id - Get campaign by ID
router.get('/:id', optionalAuth, asyncHandler(CampaignController.getById));

// POST /campaigns - Create campaign (requires farmer role)
router.post('/', authenticate, requireFarmer, asyncHandler(CampaignController.create));

// PUT /campaigns/:id/status - Update status (admin only)
router.put('/:id/status', authenticate, requireAdmin, asyncHandler(CampaignController.updateStatus));

export default router;
