import { Router } from 'express';
import { PortfolioController } from '../controllers/PortfolioController';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// GET /balances/:address - Get all balances for address
router.get('/:address', asyncHandler(PortfolioController.getBalances));

// GET /balances/:address/mkoin - Get MKOIN balance only
router.get('/:address/mkoin', asyncHandler(PortfolioController.getMkoinBalance));

export default router;
