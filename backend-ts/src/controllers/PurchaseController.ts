import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cacheService, CacheService } from '../services/CacheService';
import { Purchase, Campaign, Portfolio } from '../db/models';
import { CreatePurchaseRequest, PurchaseResponse, CampaignStats } from '../types';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';
import { getUserAddress } from '../middleware/auth.middleware';

export class PurchaseController {
  /**
   * Create purchase
   * POST /purchases
   */
  static async create(req: Request, res: Response): Promise<void> {
    const userAddress = getUserAddress(req);
    if (!userAddress) {
      throw new BadRequestError('User address required (X-User-Identity header)');
    }

    const { campaignId, mkoinPaid, tokensReceived, txHash } = req.body as CreatePurchaseRequest;

    if (!campaignId || !mkoinPaid || !tokensReceived) {
      throw new BadRequestError('campaignId, mkoinPaid, and tokensReceived required');
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    if (campaign.status !== 'running' && campaign.status !== 'approved') {
      throw new BadRequestError('Campaign is not active');
    }

    const purchase = new Purchase({
      _id: uuidv4(),
      userAddress,
      campaignId,
      mkoinPaid,
      tokensReceived,
      txHash,
      status: 'pending',
      purchasedAt: new Date(),
    });

    await purchase.save();

    // Update portfolio
    if (campaign.tokenAddress) {
      await Portfolio.findOneAndUpdate(
        { userAddress, tokenAddress: campaign.tokenAddress },
        {
          $inc: { balance: parseFloat(tokensReceived) },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    }

    // Invalidate cache
    await cacheService.del(CacheService.keys.portfolio(userAddress));
    await cacheService.del(CacheService.keys.campaignStats(campaignId));

    const response: PurchaseResponse = {
      id: purchase._id,
      userAddress: purchase.userAddress,
      campaignId: purchase.campaignId,
      campaignName: campaign.name,
      mkoinPaid: purchase.mkoinPaid,
      tokensReceived: purchase.tokensReceived,
      txHash: purchase.txHash,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt,
      confirmedAt: purchase.confirmedAt,
    };

    res.status(201).json({ purchase: response });
  }

  /**
   * Get user's purchases
   * GET /purchases/my
   */
  static async getMyPurchases(req: Request, res: Response): Promise<void> {
    const userAddress = getUserAddress(req);
    if (!userAddress) {
      throw new BadRequestError('User address required (X-User-Identity header)');
    }

    const purchases = await Purchase.find({ userAddress }).sort({ purchasedAt: -1 });

    // Get campaign details
    const campaignIds = [...new Set(purchases.map(p => p.campaignId))];
    const campaigns = await Campaign.find({ _id: { $in: campaignIds } });
    const campaignMap = new Map(campaigns.map(c => [c._id, c]));

    const response = purchases.map((purchase): PurchaseResponse => ({
      id: purchase._id,
      userAddress: purchase.userAddress,
      campaignId: purchase.campaignId,
      campaignName: campaignMap.get(purchase.campaignId)?.name,
      mkoinPaid: purchase.mkoinPaid,
      tokensReceived: purchase.tokensReceived,
      txHash: purchase.txHash,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt,
      confirmedAt: purchase.confirmedAt,
    }));

    res.json({ purchases: response });
  }

  /**
   * Get campaign purchases
   * GET /campaigns/:campaignId/purchases
   */
  static async getCampaignPurchases(req: Request, res: Response): Promise<void> {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const purchases = await Purchase.find({ campaignId }).sort({ purchasedAt: -1 });

    const response = purchases.map((purchase): PurchaseResponse => ({
      id: purchase._id,
      userAddress: purchase.userAddress,
      campaignId: purchase.campaignId,
      campaignName: campaign.name,
      mkoinPaid: purchase.mkoinPaid,
      tokensReceived: purchase.tokensReceived,
      txHash: purchase.txHash,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt,
      confirmedAt: purchase.confirmedAt,
    }));

    res.json({ purchases: response });
  }

  /**
   * Get campaign statistics
   * GET /campaigns/:campaignId/stats
   */
  static async getCampaignStats(req: Request, res: Response): Promise<void> {
    const { campaignId } = req.params;

    // Check cache
    const cacheKey = CacheService.keys.campaignStats(campaignId);
    const cached = await cacheService.get<CampaignStats>(cacheKey);

    if (cached) {
      res.json({ stats: cached });
      return;
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const purchases = await Purchase.find({ campaignId, status: 'confirmed' });

    let totalMkoinPaid = BigInt(0);
    let totalTokensSold = BigInt(0);
    const uniqueBuyers = new Set<string>();

    for (const purchase of purchases) {
      totalMkoinPaid += BigInt(purchase.mkoinPaid);
      totalTokensSold += BigInt(purchase.tokensReceived);
      uniqueBuyers.add(purchase.userAddress);
    }

    const stats: CampaignStats = {
      campaignId,
      totalPurchases: purchases.length,
      totalMkoinPaid: totalMkoinPaid.toString(),
      totalTokensSold: totalTokensSold.toString(),
      uniqueBuyers: uniqueBuyers.size,
    };

    // Cache for 60 seconds
    await cacheService.set(cacheKey, stats, CacheService.ttl.campaignStats);

    res.json({ stats });
  }

  /**
   * Confirm purchase (update status to confirmed)
   * PUT /purchases/:id/confirm
   */
  static async confirmPurchase(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    purchase.status = 'confirmed';
    purchase.confirmedAt = new Date();
    await purchase.save();

    // Invalidate cache
    await cacheService.del(CacheService.keys.portfolio(purchase.userAddress));
    await cacheService.del(CacheService.keys.campaignStats(purchase.campaignId));

    res.json({ message: 'Purchase confirmed', purchaseId: id });
  }
}
