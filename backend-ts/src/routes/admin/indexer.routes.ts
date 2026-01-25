import { Router } from "express";
import { IndexerController } from "../../controllers/IndexerController";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/error.middleware";

const router = Router();

// Protect all indexer routes - admin only
router.use(authenticateToken, requireAdmin);

// Get indexer status
router.get("/status", asyncHandler(IndexerController.getStatus));

// Control indexer
router.post("/start", asyncHandler(IndexerController.start));
router.post("/stop", asyncHandler(IndexerController.stop));
router.post("/reindex", asyncHandler(IndexerController.reindex));

// Get indexed transactions
router.get("/transactions", asyncHandler(IndexerController.getTransactions));
router.get(
  "/transactions/:hash",
  asyncHandler(IndexerController.getTransactionByHash),
);

export default router;
