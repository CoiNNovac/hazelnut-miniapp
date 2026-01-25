import { Request, Response } from 'express';
import { cacheService, CacheService } from '../services/CacheService';
import { mkoinService } from '../services/ton/MkoinService';
import { Portfolio, Token, Campaign } from '../db/models';
import { BalanceResponse, PortfolioResponse, TokenBalance, PortfolioHolding } from '../types';
import { BadRequestError } from '../middleware/error.middleware';

export class PortfolioController {
  /**
   * Get all balances for an address (MKOIN + tokens)
   * GET /balances/:address
   */
  static async getBalances(req: Request, res: Response): Promise<void> {
    const { address } = req.params;

    if (!address) {
      throw new BadRequestError('Address required');
    }

    // Check cache
    const cacheKey = CacheService.keys.portfolio(address);
    const cached = await cacheService.get<BalanceResponse>(cacheKey);

    if (cached) {
      res.json(cached);
      return;
    }

    // Get MKOIN balance
    let mkoinBalance: string;
    try {
      const balance = await mkoinService.getBalance(address);
      mkoinBalance = balance.toString();
    } catch (error) {
      console.error('Error getting MKOIN balance:', error);
      mkoinBalance = '0';
    }

    // Get token balances from database
    const portfolios = await Portfolio.find({ userAddress: address });

    // Get token details
    const tokenAddresses = portfolios.map(p => p.tokenAddress);
    const tokens = await Token.find({ address: { $in: tokenAddresses } });
    const tokenMap = new Map(tokens.map(t => [t.address, t]));

    const tokenBalances: TokenBalance[] = portfolios.map(portfolio => {
      const token = tokenMap.get(portfolio.tokenAddress);
      return {
        tokenAddress: portfolio.tokenAddress,
        symbol: token?.symbol || 'UNKNOWN',
        balance: portfolio.balance,
        campaignId: token?.campaignId,
      };
    });

    const response: BalanceResponse = {
      address,
      mkoinBalance,
      tokens: tokenBalances,
    };

    // Cache for 30 seconds
    await cacheService.set(cacheKey, response, CacheService.ttl.portfolio);

    res.json(response);
  }

  /**
   * Get MKOIN balance only
   * GET /balances/:address/mkoin
   */
  static async getMkoinBalance(req: Request, res: Response): Promise<void> {
    const { address } = req.params;

    if (!address) {
      throw new BadRequestError('Address required');
    }

    // Check cache
    const cacheKey = CacheService.keys.mkoinBalance(address);
    const cached = await cacheService.get<string>(cacheKey);

    if (cached) {
      res.json({ address, balance: cached });
      return;
    }

    let balance: string;
    try {
      const balanceBigInt = await mkoinService.getBalance(address);
      balance = balanceBigInt.toString();
    } catch (error) {
      console.error('Error getting MKOIN balance:', error);
      balance = '0';
    }

    // Cache for 30 seconds
    await cacheService.set(cacheKey, balance, CacheService.ttl.mkoinBalance);

    res.json({ address, balance });
  }

  /**
   * Get full portfolio with values
   * GET /portfolio/:address
   */
  static async getPortfolio(req: Request, res: Response): Promise<void> {
    const { address } = req.params;

    if (!address) {
      throw new BadRequestError('Address required');
    }

    // Get all portfolios
    const portfolios = await Portfolio.find({ userAddress: address });

    // Get token details and campaigns
    const tokenAddresses = portfolios.map(p => p.tokenAddress);
    const tokens = await Token.find({ address: { $in: tokenAddresses } });
    const tokenMap = new Map(tokens.map(t => [t.address, t]));

    const campaignIds = tokens.filter(t => t.campaignId).map(t => t.campaignId!);
    const campaigns = await Campaign.find({ _id: { $in: campaignIds } });
    const campaignMap = new Map(campaigns.map(c => [c._id, c]));

    let totalValue = BigInt(0);

    const holdings: PortfolioHolding[] = portfolios.map(portfolio => {
      const token = tokenMap.get(portfolio.tokenAddress);
      const campaign = token?.campaignId ? campaignMap.get(token.campaignId) : null;

      const balance = BigInt(portfolio.balance || '0');
      const price = campaign ? BigInt(parseFloat(campaign.suggestedPrice) * 1e9) : BigInt(0);
      const value = (balance * price) / BigInt(1e9);

      totalValue += value;

      return {
        tokenAddress: portfolio.tokenAddress,
        tokenSymbol: token?.symbol || 'UNKNOWN',
        balance: portfolio.balance,
        value: value.toString(),
        campaignId: token?.campaignId,
      };
    });

    const response: PortfolioResponse = {
      userAddress: address,
      totalValue: totalValue.toString(),
      holdings,
    };

    res.json({ portfolio: response });
  }
}
