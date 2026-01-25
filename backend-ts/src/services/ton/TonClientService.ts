import { TonClient, WalletContractV5R1 } from '@ton/ton';
import { Address, toNano } from '@ton/core';
import { mnemonicToWalletKey, KeyPair } from '@ton/crypto';
import { config } from '../../config';

export class TonClientService {
  private static instance: TonClientService;
  private client: TonClient;
  private adminWallet: WalletContractV5R1 | null = null;
  private adminKeyPair: KeyPair | null = null;

  private constructor() {
    this.client = new TonClient({
      endpoint: config.tonEndpoint,
      apiKey: config.tonApiKey,
    });
  }

  static getInstance(): TonClientService {
    if (!TonClientService.instance) {
      TonClientService.instance = new TonClientService();
    }
    return TonClientService.instance;
  }

  async initialize(): Promise<void> {
    if (!config.adminMnemonic) {
      console.warn('ADMIN_MNEMONIC not configured, TON operations will be disabled');
      return;
    }

    const mnemonic = config.adminMnemonic.split(' ');
    if (mnemonic.length !== 24) {
      throw new Error('Invalid mnemonic: must be 24 words');
    }

    this.adminKeyPair = await mnemonicToWalletKey(mnemonic);
    this.adminWallet = WalletContractV5R1.create({
      publicKey: this.adminKeyPair.publicKey,
      workchain: 0,
    });

    console.log(`Admin wallet initialized: ${this.adminWallet.address.toString()}`);
  }

  getClient(): TonClient {
    return this.client;
  }

  getAdminWallet(): WalletContractV5R1 {
    if (!this.adminWallet) {
      throw new Error('Admin wallet not initialized');
    }
    return this.adminWallet;
  }

  getAdminAddress(): Address {
    return this.getAdminWallet().address;
  }

  getAdminSecretKey(): Buffer {
    if (!this.adminKeyPair) {
      throw new Error('Admin key pair not initialized');
    }
    return this.adminKeyPair.secretKey;
  }

  getAdminSender() {
    const wallet = this.getAdminWallet();
    const contract = this.client.open(wallet);
    return contract.sender(this.getAdminSecretKey());
  }

  async getBalance(address: string): Promise<bigint> {
    const addr = Address.parse(address);
    return this.client.getBalance(addr);
  }

  async waitForTransaction(address: string, timeout: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    const addr = Address.parse(address);

    let lastLt: bigint | undefined;

    while (Date.now() - startTime < timeout) {
      try {
        const transactions = await this.client.getTransactions(addr, { limit: 1 });
        if (transactions.length > 0) {
          const currentLt = transactions[0].lt;
          if (lastLt === undefined) {
            lastLt = currentLt;
          } else if (currentLt > lastLt) {
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
      }

      await this.sleep(2000);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const tonClientService = TonClientService.getInstance();
