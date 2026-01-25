import { Router } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./admin/users.routes";
import mkoinRoutes from "./admin/mkoin.routes";
import campaignsRoutes from "./admin/campaigns.routes";
import indexerRoutes from "./admin/indexer.routes";
import purchasesRoutes from "./purchases.routes";
import balancesRoutes from "./balances.routes";
import portfolioRoutes from "./portfolio.routes";
import { PurchaseController } from "../controllers/PurchaseController";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Admin routes
router.use("/admin/users", usersRoutes);
router.use("/admin/mkoin", mkoinRoutes);
router.use("/admin/indexer", indexerRoutes);

// Campaign routes (mixed access)
router.use("/campaigns", campaignsRoutes);

// Campaign purchase stats (must be before /purchases to avoid route conflict)
router.get(
  "/campaigns/:campaignId/purchases",
  asyncHandler(PurchaseController.getCampaignPurchases),
);
router.get(
  "/campaigns/:campaignId/stats",
  asyncHandler(PurchaseController.getCampaignStats),
);

// Purchase routes
router.use("/purchases", purchasesRoutes);

// Balance routes
router.use("/balances", balancesRoutes);

// Portfolio routes
router.use("/portfolio", portfolioRoutes);

export default router;
