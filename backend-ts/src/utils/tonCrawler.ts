import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";

export interface Transaction {
  hash: string;
  lt: string;
  utime: number;
  inMsg?: {
    source?: string;
    destination: string;
    value: string;
    body?: string;
  };
  outMsgs: Array<{
    source: string;
    destination?: string;
    value: string;
    body?: string;
  }>;
}

export interface CrawlerOptions {
  endpoint: string;
  apiKey?: string;
  batchSize?: number;
  pollInterval?: number;
}

export class TonCrawler {
  private client: TonClient;
  private batchSize: number;
  private pollInterval: number;

  constructor(options: CrawlerOptions) {
    this.client = new TonClient({
      endpoint: options.endpoint,
      apiKey: options.apiKey,
    });
    this.batchSize = options.batchSize || 100;
    this.pollInterval = options.pollInterval || 5000; // 5 seconds
  }

  /**
   * Get transactions for a specific address
   */
  async getTransactions(
    address: string,
    limit: number = 100,
    lt?: string,
    hash?: string,
  ): Promise<Transaction[]> {
    try {
      const addr = Address.parse(address);
      const transactions = await this.client.getTransactions(addr, {
        limit,
        lt: lt,
        hash: hash,
      } as any);

      return transactions.map((tx) => ({
        hash: tx.hash().toString("base64"),
        lt: tx.lt.toString(),
        utime: tx.now,
        inMsg: tx.inMessage
          ? {
              source: tx.inMessage.info.src?.toString(),
              destination: tx.inMessage.info.dest?.toString() || "",
              value: (tx.inMessage.info as any).value?.coins?.toString() || "0",
              body: tx.inMessage.body.hash().toString("base64"),
            }
          : undefined,
        outMsgs: tx.outMessages.values().map((msg) => ({
          source: msg.info.src?.toString() || "",
          destination: msg.info.dest?.toString(),
          value: (msg.info as any).value?.coins?.toString() || "0",
          body: msg.body.hash().toString("base64"),
        })),
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching transactions for ${address}: ${errorMsg}`);
      return [];
    }
  }

  /**
   * Get latest transactions since a specific logical time
   */
  async getTransactionsSince(
    address: string,
    sinceLt: string,
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let lastLt: string | undefined;
    let lastHash: string | undefined;

    while (true) {
      const txs = await this.getTransactions(
        address,
        this.batchSize,
        lastLt,
        lastHash,
      );

      if (txs.length === 0) break;

      // Filter transactions newer than sinceLt
      const newTxs = txs.filter((tx) => BigInt(tx.lt) > BigInt(sinceLt));

      if (newTxs.length === 0) break;

      allTransactions.push(...newTxs);

      // If we got less than batch size, we've reached the end
      if (txs.length < this.batchSize) break;

      // Update pagination
      const lastTx = txs[txs.length - 1];
      lastLt = lastTx.lt;
      lastHash = lastTx.hash;

      // If the oldest transaction in this batch is older than sinceLt, we're done
      if (BigInt(lastTx.lt) <= BigInt(sinceLt)) break;
    }

    // Sort by lt descending (newest first)
    return allTransactions.sort((a, b) => Number(BigInt(b.lt) - BigInt(a.lt)));
  }

  /**
   * Stream transactions in real-time with polling
   */
  async *streamTransactions(
    address: string,
    fromLt?: string,
  ): AsyncGenerator<Transaction> {
    let lastLt = fromLt || "0";

    while (true) {
      const newTxs = await this.getTransactionsSince(address, lastLt);

      for (const tx of newTxs.reverse()) {
        yield tx;
        lastLt = tx.lt;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
    }
  }

  /**
   * Get account state and last transaction
   */
  async getAccountState(address: string): Promise<{
    balance: string;
    lastTransactionLt: string;
    lastTransactionHash: string;
  } | null> {
    try {
      const addr = Address.parse(address);
      const state = await this.client.getContractState(addr);

      if (!state.lastTransaction) {
        return null;
      }

      return {
        balance: state.balance.toString(),
        lastTransactionLt: state.lastTransaction.lt.toString(),
        lastTransactionHash: state.lastTransaction.hash,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching account state for ${address}: ${errorMsg}`);
      return null;
    }
  }

  /**
   * Decode message body (basic implementation)
   */
  decodeMessageBody(body: string): any {
    try {
      const buffer = Buffer.from(body, "base64");
      // Basic decoding - can be extended based on contract ABI
      return {
        raw: body,
        size: buffer.length,
      };
    } catch (error) {
      return { raw: body, error: "Failed to decode" };
    }
  }

  /**
   * Wait for a transaction to be confirmed
   */
  async waitForTransaction(
    address: string,
    timeoutMs: number = 30000,
  ): Promise<Transaction | null> {
    const startTime = Date.now();
    let lastLt = "0";

    while (Date.now() - startTime < timeoutMs) {
      const txs = await this.getTransactionsSince(address, lastLt);

      if (txs.length > 0) {
        return txs[0]; // Return the newest transaction
      }

      lastLt = txs[txs.length - 1]?.lt || lastLt;

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return null;
  }

  /**
   * Get client instance
   */
  getClient(): TonClient {
    return this.client;
  }
}
