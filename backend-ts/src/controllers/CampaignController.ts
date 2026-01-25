import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/AuthService';
import { cacheService, CacheService } from '../services/CacheService';
import { factoryService } from '../services/ton/FactoryService';
import { Campaign, User, Token } from '../db/models';
import { CreateCampaignRequest, UpdateCampaignStatusRequest, CampaignResponse, CampaignStatus } from '../types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/error.middleware';

export class CampaignController {
  /**
   * List campaigns (filtered by user role)
   * GET /campaigns
   */
  static async list(req: Request, res: Response): Promise<void> {
    const status = req.query.status as CampaignStatus | undefined;
    const farmerId = req.query.farmerId as string | undefined;

    const filter: any = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by farmer - non-admins can only see their own campaigns
    if (req.user && !AuthService.isAdmin(req.user.role)) {
      filter.farmerId = req.user.sub;
    } else if (farmerId) {
      filter.farmerId = farmerId;
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

    // Get farmer names
    const farmerIds = [...new Set(campaigns.map(c => c.farmerId))];
    const farmers = await User.find({ _id: { $in: farmerIds } });
    const farmerMap = new Map(farmers.map(f => [f._id, f.name || f.username || f.address]));

    const response = campaigns.map((campaign): CampaignResponse => ({
      id: campaign._id,
      farmerId: campaign.farmerId,
      farmerName: farmerMap.get(campaign.farmerId),
      name: campaign.name,
      description: campaign.description,
      tokenName: campaign.tokenName,
      tokenSymbol: campaign.tokenSymbol,
      tokenSupply: campaign.tokenSupply,
      logoUrl: campaign.logoUrl,
      imageUrl: campaign.imageUrl,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      suggestedPrice: campaign.suggestedPrice,
      status: campaign.status,
      tokenAddress: campaign.tokenAddress,
      mintedAt: campaign.mintedAt,
      mintTxHash: campaign.mintTxHash,
      createdAt: campaign.createdAt,
    }));

    res.json({ campaigns: response });
  }

  /**
   * Get campaign by ID
   * GET /campaigns/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    // Non-admins can only view their own campaigns
    if (req.user && !AuthService.isAdmin(req.user.role) && campaign.farmerId !== req.user.sub) {
      throw new ForbiddenError('Access denied');
    }

    const farmer = await User.findById(campaign.farmerId);

    const response: CampaignResponse = {
      id: campaign._id,
      farmerId: campaign.farmerId,
      farmerName: farmer?.name || farmer?.username || farmer?.address,
      name: campaign.name,
      description: campaign.description,
      tokenName: campaign.tokenName,
      tokenSymbol: campaign.tokenSymbol,
      tokenSupply: campaign.tokenSupply,
      logoUrl: campaign.logoUrl,
      imageUrl: campaign.imageUrl,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      suggestedPrice: campaign.suggestedPrice,
      status: campaign.status,
      tokenAddress: campaign.tokenAddress,
      mintedAt: campaign.mintedAt,
      mintTxHash: campaign.mintTxHash,
      createdAt: campaign.createdAt,
    };

    res.json({ campaign: response });
  }

  /**
   * Create new campaign (farmer request)
   * POST /campaigns
   */
  static async create(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateCampaignRequest;

    if (!data.name || !data.tokenName || !data.tokenSymbol || !data.tokenSupply) {
      throw new BadRequestError('Name, tokenName, tokenSymbol, and tokenSupply required');
    }

    const campaign = new Campaign({
      _id: uuidv4(),
      farmerId: req.user!.sub,
      name: data.name,
      description: data.description,
      tokenName: data.tokenName,
      tokenSymbol: data.tokenSymbol,
      tokenSupply: data.tokenSupply,
      logoUrl: data.logoUrl,
      imageUrl: data.imageUrl,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      suggestedPrice: data.suggestedPrice,
      status: 'pending',
    });

    await campaign.save();

    // Invalidate cache
    await cacheService.delPattern('campaigns:*');

    const farmer = await User.findById(campaign.farmerId);

    const response: CampaignResponse = {
      id: campaign._id,
      farmerId: campaign.farmerId,
      farmerName: farmer?.name || farmer?.username || farmer?.address,
      name: campaign.name,
      description: campaign.description,
      tokenName: campaign.tokenName,
      tokenSymbol: campaign.tokenSymbol,
      tokenSupply: campaign.tokenSupply,
      logoUrl: campaign.logoUrl,
      imageUrl: campaign.imageUrl,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      suggestedPrice: campaign.suggestedPrice,
      status: campaign.status,
      tokenAddress: campaign.tokenAddress,
      mintedAt: campaign.mintedAt,
      mintTxHash: campaign.mintTxHash,
      createdAt: campaign.createdAt,
    };

    res.status(201).json({ campaign: response });
  }

  /**
   * Update campaign status (admin only)
   * PUT /campaigns/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body as UpdateCampaignStatusRequest;

    if (!status) {
      throw new BadRequestError('Status required');
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    const farmer = await User.findById(campaign.farmerId);
    if (!farmer) {
      throw new NotFoundError('Farmer not found');
    }

    // If approving, deploy the token on blockchain
    if (status === 'approved' && campaign.status === 'pending') {
      try {
        // Convert token supply to bigint (nanocoins)
        const supply = BigInt(parseFloat(campaign.tokenSupply) * 1e9);

        const { txHash, jettonAddress } = await factoryService.createCampaignToken(
          farmer.address,
          campaign.tokenName,
          campaign.tokenSymbol,
          supply
        );

        campaign.tokenAddress = jettonAddress;
        campaign.mintTxHash = txHash;
        campaign.mintedAt = new Date();
        campaign.mintAmount = campaign.tokenSupply;

        // Register token in database
        const token = new Token({
          address: jettonAddress,
          symbol: campaign.tokenSymbol,
          name: campaign.tokenName,
          isAgriToken: true,
          totalSupply: campaign.tokenSupply,
          campaignId: campaign._id,
        });
        await token.save();
      } catch (error) {
        console.error('Token deployment failed:', error);
        throw new BadRequestError(`Token deployment failed: ${(error as Error).message}`);
      }
    }

    campaign.status = status;
    await campaign.save();

    // Invalidate cache
    await cacheService.delPattern('campaigns:*');

    const response: CampaignResponse = {
      id: campaign._id,
      farmerId: campaign.farmerId,
      farmerName: farmer.name || farmer.username || farmer.address,
      name: campaign.name,
      description: campaign.description,
      tokenName: campaign.tokenName,
      tokenSymbol: campaign.tokenSymbol,
      tokenSupply: campaign.tokenSupply,
      logoUrl: campaign.logoUrl,
      imageUrl: campaign.imageUrl,
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      suggestedPrice: campaign.suggestedPrice,
      status: campaign.status,
      tokenAddress: campaign.tokenAddress,
      mintedAt: campaign.mintedAt,
      mintTxHash: campaign.mintTxHash,
      createdAt: campaign.createdAt,
    };

    res.json({ campaign: response });
  }
}
