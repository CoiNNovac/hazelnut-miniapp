import { Address, toNano, beginCell, Cell } from "@ton/core";
import { config } from "../../config";
import { tonClientService } from "./TonClientService";

// Import the TACT-generated contract wrapper
import {
  JettonFactory,
  CreateJetton,
} from "../../../contracts-build/JettonFactory/tact_JettonFactory";

export class FactoryService {
  private static instance: FactoryService;
  private factoryAddress: Address;

  private constructor() {
    this.factoryAddress = Address.parse(config.factoryAddress);
  }

  static getInstance(): FactoryService {
    if (!FactoryService.instance) {
      FactoryService.instance = new FactoryService();
    }
    return FactoryService.instance;
  }

  /**
   * Create a new Jetton token for a campaign
   */
  async createCampaignToken(
    farmerAddress: string,
    tokenName: string,
    tokenSymbol: string,
    initialSupply: bigint,
    metadataUrl?: string,
  ): Promise<{ txHash: string; jettonAddress: string }> {
    const client = tonClientService.getClient();
    const sender = tonClientService.getAdminSender();

    // Open the factory contract
    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    // Build metadata content cell (TEP-64 off-chain format)
    const url =
      metadataUrl ||
      `https://hazelnut.ag/api/metadata/${tokenSymbol}/${tokenName}`;
    const content = beginCell()
      .storeUint(0x01, 8) // Off-chain metadata prefix
      .storeStringTail(url)
      .endCell();

    const farmerWallet = Address.parse(farmerAddress);

    console.log(`Creating campaign token: ${tokenSymbol} (${tokenName})`);
    console.log(`Farmer wallet: ${farmerAddress}`);
    console.log(`Initial supply: ${Number(initialSupply) / 1e9}`);

    // Send CreateJetton transaction
    await factory.send(
      sender,
      { value: toNano("1.0") }, // 1 TON for gas + storage
      {
        $$type: "CreateJetton",
        farmer_wallet: farmerWallet,
        content: content,
        initial_supply: initialSupply,
      } as CreateJetton,
    );

    console.log("CreateJetton transaction sent, waiting for confirmation...");

    // Wait for transaction
    await tonClientService.waitForTransaction(
      this.factoryAddress.toString(),
      30000,
    );

    // Get the created jetton address
    // Note: In a real implementation, you'd parse the transaction to get the actual address
    // For now, we compute it based on the factory's getter
    let jettonAddress: string;
    try {
      const adminAddress = tonClientService.getAdminAddress();
      const jettonAddr = await factory.getGetJettonAddress(
        adminAddress,
        content,
      );
      jettonAddress = jettonAddr.toString();
    } catch (error) {
      console.error("Error getting jetton address:", error);
      // Fallback: generate placeholder
      jettonAddress = `pending_${Date.now()}`;
    }

    const txHash = `factory_create_${Date.now()}`;

    return { txHash, jettonAddress };
  }

  /**
   * Mint more tokens for an existing jetton
   */
  async mintMoreTokens(jettonAddress: string, amount: bigint): Promise<string> {
    const client = tonClientService.getClient();
    const sender = tonClientService.getAdminSender();

    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    await factory.send(
      sender,
      { value: toNano("0.5") },
      {
        $$type: "MintMore",
        jetton_address: Address.parse(jettonAddress),
        amount: amount,
      },
    );

    await tonClientService.waitForTransaction(
      this.factoryAddress.toString(),
      30000,
    );

    return `mint_more_${Date.now()}`;
  }

  /**
   * Get the farmer wallet for a jetton
   */
  async getFarmerWallet(jettonAddress: string): Promise<string | null> {
    const client = tonClientService.getClient();
    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    try {
      const farmer = await factory.getGetFarmerWallet(
        Address.parse(jettonAddress),
      );
      return farmer?.toString() || null;
    } catch (error) {
      console.error("Error getting farmer wallet:", error);
      return null;
    }
  }

  /**
   * Get the jetton address for given content
   */
  async getJettonAddress(owner: Address, content: Cell): Promise<string> {
    const client = tonClientService.getClient();
    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    const addr = await factory.getGetJettonAddress(owner, content);
    return addr.toString();
  }

  /**
   * Get total number of jettons created
   */
  async getJettonCount(): Promise<bigint> {
    const client = tonClientService.getClient();
    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    return factory.getGetJettonCount();
  }

  /**
   * Get the factory owner
   */
  async getOwner(): Promise<string> {
    const client = tonClientService.getClient();
    const factory = client.open(JettonFactory.fromAddress(this.factoryAddress));

    const owner = await factory.getOwner();
    return owner.toString();
  }
}

export const factoryService = FactoryService.getInstance();
