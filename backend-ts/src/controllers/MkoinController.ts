import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { mkoinService } from "../services/ton/MkoinService";
import { cacheService, CacheService } from "../services/CacheService";
import { MkoinMint } from "../db/models";
import { MintMkoinRequest, MkoinMintResponse } from "../types";
import { BadRequestError } from "../middleware/error.middleware";
import { config } from "../config";

export class MkoinController {
  /**
   * Mint MKOIN tokens to a recipient
   * POST /admin/mkoin/mint
   */
  static async mint(req: Request, res: Response): Promise<void> {
    const { recipient, amount } = req.body as MintMkoinRequest;

    if (!recipient || !amount) {
      throw new BadRequestError("Recipient and amount required");
    }

    // Convert amount to nano units (e.g., 3 MKOIN -> 3 * 10^9 nano MKOIN)
    // Parse as float first to handle decimals, then multiply before converting to BigInt
    const amountFloat = parseFloat(amount.toString());
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new BadRequestError("Invalid amount");
    }
    const amountBigInt = BigInt(
      Math.floor(amountFloat * 10 ** config.mkoinDecimals),
    );

    // Create mint record in pending status
    const mintRecord = new MkoinMint({
      _id: uuidv4(),
      recipientAddress: recipient,
      amount: amount,
      mintedBy: req.user?.sub,
      status: "pending",
      mintedAt: new Date(),
    });
    await mintRecord.save();

    try {
      // Perform the actual minting on blockchain
      const txHash = await mkoinService.mintMkoin(recipient, amountBigInt);

      // Update record with success
      mintRecord.txHash = txHash;
      mintRecord.status = "confirmed";
      mintRecord.confirmedAt = new Date();
      await mintRecord.save();

      // Invalidate cache
      await cacheService.del(CacheService.keys.mkoinBalance(recipient));
      await cacheService.del(CacheService.keys.mkoinTotalSupply());

      const response: MkoinMintResponse = {
        id: mintRecord._id,
        recipientAddress: mintRecord.recipientAddress,
        amount: mintRecord.amount,
        txHash: mintRecord.txHash,
        mintedBy: mintRecord.mintedBy,
        status: mintRecord.status,
        mintedAt: mintRecord.mintedAt,
        confirmedAt: mintRecord.confirmedAt,
      };

      res.json(response);
    } catch (error) {
      // Update record with failure
      mintRecord.status = "failed";
      await mintRecord.save();

      console.error("MKOIN minting failed:", error);
      throw new BadRequestError(`Minting failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get MKOIN balance for an address
   * GET /admin/mkoin/balance/:address
   */
  static async getBalance(req: Request, res: Response): Promise<void> {
    const { address } = req.params;

    if (!address) {
      throw new BadRequestError("Address required");
    }

    // Check cache first
    const cacheKey = CacheService.keys.mkoinBalance(address);
    const cached = await cacheService.get<string>(cacheKey);

    if (cached) {
      res.json({ address, balance: cached });
      return;
    }

    const balance = await mkoinService.getBalance(address);
    const balanceStr = balance.toString();

    // Cache for 30 seconds
    await cacheService.set(cacheKey, balanceStr, CacheService.ttl.mkoinBalance);

    res.json({ address, balance: balanceStr });
  }

  /**
   * Get total MKOIN supply
   * GET /admin/mkoin/total-supply
   */
  static async getTotalSupply(req: Request, res: Response): Promise<void> {
    // Check cache first
    const cacheKey = CacheService.keys.mkoinTotalSupply();
    const cached = await cacheService.get<string>(cacheKey);

    if (cached) {
      const totalSupplyMkoin = (
        BigInt(cached) / BigInt(10 ** config.mkoinDecimals)
      ).toString();
      res.json({
        total_supply: totalSupplyMkoin,
        total_supply_nanocoins: cached,
      });
      return;
    }

    const totalSupply = await mkoinService.getTotalSupply();
    const supplyStr = totalSupply.toString();

    // Cache for 30 seconds
    await cacheService.set(
      cacheKey,
      supplyStr,
      CacheService.ttl.mkoinTotalSupply,
    );

    const totalSupplyMkoin = (
      totalSupply / BigInt(10 ** config.mkoinDecimals)
    ).toString();
    res.json({
      total_supply: totalSupplyMkoin,
      total_supply_nanocoins: supplyStr,
    });
  }

  /**
   * Get MKOIN mint history
   * GET /admin/mkoin/history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const mints = await MkoinMint.find()
      .sort({ mintedAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await MkoinMint.countDocuments();

    const response = mints.map((mint) => ({
      id: mint._id,
      recipient_address: mint.recipientAddress,
      amount: mint.amount,
      tx_hash: mint.txHash,
      minted_by: mint.mintedBy,
      status: mint.status,
      minted_at: mint.mintedAt,
      confirmed_at: mint.confirmedAt,
    }));

    res.json(response);
  }

  /**
   * Get MKOIN wallet address for an owner
   * GET /admin/mkoin/wallet/:address
   */
  static async getWalletAddress(req: Request, res: Response): Promise<void> {
    const { address } = req.params;

    if (!address) {
      throw new BadRequestError("Address required");
    }

    const walletAddress = await mkoinService.getWalletAddress(address);

    res.json({ ownerAddress: address, walletAddress });
  }
}
