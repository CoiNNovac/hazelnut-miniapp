import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// GET /portfolio/:address - Get full portfolio with values
router.get('/:address', asyncHandler(PortfolioController.getPortfolio));

export default router;
