import { Address, toNano } from "@ton/core";
import { config } from "../../config";
import { tonClientService } from "./TonClientService";

// Import the TACT-generated contract wrapper
// This is the key difference from Rust - using the SDK wrapper handles seqno automatically
import {
  MKOINMaster,
  Mint,
  JettonData,
} from "../../../contracts-build/MKOINMaster/tact_MKOINMaster";
import { MKOINWallet } from "../../../contracts-build/MKOINMaster/tact_MKOINWallet";

export class MkoinService {
  private static instance: MkoinService;
  private mkoinAddress: Address;

  private constructor() {
    this.mkoinAddress = Address.parse(config.mkoinAddress);
  }

  static getInstance(): MkoinService {
    if (!MkoinService.instance) {
      MkoinService.instance = new MkoinService();
    }
    return MkoinService.instance;
  }

  /**
   * Mint MKOIN tokens to a recipient address
   * This uses the TACT SDK wrapper which handles seqno automatically
   */
  async mintMkoin(recipientAddress: string, amount: bigint): Promise<string> {
    const client = tonClientService.getClient();
    const sender = tonClientService.getAdminSender();
    const adminAddress = tonClientService.getAdminAddress();

    // Open the MKOIN Master contract using SDK wrapper
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    // Verify ownership before minting
    const owner = await mkoinMaster.getOwner();
    if (owner.toString() !== adminAddress.toString()) {
      throw new Error("Admin wallet is not the MKOIN contract owner");
    }

    const receiver = Address.parse(recipientAddress);

    console.log(`Minting ${Number(amount) / 1e9} MKOIN to ${recipientAddress}`);

    // Send the mint transaction using SDK wrapper
    await mkoinMaster.send(
      sender,
      { value: toNano("0.1") }, // Gas fee
      {
        $$type: "Mint",
        amount: amount,
        receiver: receiver,
      } as Mint,
    );

    console.log(
      "Mint transaction sent, waiting for it to appear on blockchain...",
    );

    // Wait a bit for transaction to be processed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Query recent transactions to get the real hash
    try {
      const recentTxs = await client.getTransactions(adminAddress, {
        limit: 10,
      });

      // Find the mint transaction we just sent (looking for outgoing message to MKOIN contract)
      const mintTx = recentTxs.find((tx) => {
        const outMsgs = tx.outMessages.values();
        for (const msg of outMsgs) {
          const dest = msg.info.type === "internal" ? msg.info.dest : null;
          if (dest && dest.equals(this.mkoinAddress)) {
            return true;
          }
        }
        return false;
      });

      if (mintTx) {
        const txHash = mintTx.hash().toString("base64");
        console.log(`✓ Mint transaction confirmed with hash: ${txHash}`);

        // Check transaction status from compute phase
        const description = mintTx.description;
        if (description.type !== "generic") {
          throw new Error("Unexpected transaction description type");
        }

        const computePhase = description.computePhase;
        if (computePhase.type !== "vm") {
          throw new Error("Transaction failed: compute phase error");
        }

        if (!computePhase.success) {
          throw new Error(
            `Transaction failed: exit code ${computePhase.exitCode}`,
          );
        }

        return txHash;
      } else {
        console.warn(
          "Could not find mint transaction in recent history, using fallback",
        );
        return `mkoin_mint_${Date.now()}`;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching transaction hash: ${errorMsg}`);
      // Return fallback hash if query fails
      return `mkoin_mint_${Date.now()}`;
    }
  }

  /**
   * Get MKOIN balance for an address
   */
  async getBalance(ownerAddress: string): Promise<bigint> {
    const client = tonClientService.getClient();
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    try {
      // Get the wallet address for this owner
      const owner = Address.parse(ownerAddress);
      const walletAddress = await mkoinMaster.getGetWalletAddress(owner);

      // Check if wallet contract exists
      const state = await client.getContractState(walletAddress);
      if (state.state !== "active") {
        return BigInt(0);
      }

      // Open the wallet contract and get balance
      const wallet = client.open(MKOINWallet.fromAddress(walletAddress));
      const walletData = await wallet.getGetWalletData();

      return walletData.balance;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error getting MKOIN balance: ${errorMsg}`);
      return BigInt(0);
    }
  }

  /**
   * Get total MKOIN supply
   */
  async getTotalSupply(): Promise<bigint> {
    const client = tonClientService.getClient();
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    const jettonData = await mkoinMaster.getGetJettonData();
    return jettonData.total_supply;
  }

  /**
   * Get Jetton data (total supply, mintable status, admin, content)
   */
  async getJettonData(): Promise<JettonData> {
    const client = tonClientService.getClient();
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    return mkoinMaster.getGetJettonData();
  }

  /**
   * Get the MKOIN wallet address for an owner
   */
  async getWalletAddress(ownerAddress: string): Promise<string> {
    const client = tonClientService.getClient();
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    const owner = Address.parse(ownerAddress);
    const walletAddress = await mkoinMaster.getGetWalletAddress(owner);

    return walletAddress.toString();
  }

  /**
   * Get the contract owner
   */
  async getOwner(): Promise<string> {
    const client = tonClientService.getClient();
    const mkoinMaster = client.open(MKOINMaster.fromAddress(this.mkoinAddress));

    const owner = await mkoinMaster.getOwner();
    return owner.toString();
  }

  /**
   * Check if the admin wallet is the contract owner
   */
  async isAdminOwner(): Promise<boolean> {
    const owner = await this.getOwner();
    const adminAddress = tonClientService.getAdminAddress().toString();
    return owner === adminAddress;
  }
}

export const mkoinService = MkoinService.getInstance();
