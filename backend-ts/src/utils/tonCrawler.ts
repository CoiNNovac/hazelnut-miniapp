import { Address } from "@ton/core";
import axios from "axios";

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
  private endpoint: string;
  private apiKey?: string;
  private batchSize: number;
  private pollInterval: number;

  constructor(options: CrawlerOptions) {
    this.endpoint = options.endpoint;
    this.apiKey = options.apiKey;
    this.batchSize = options.batchSize || 100;
    this.pollInterval = options.pollInterval || 5000; // 5 seconds
  }

  /**
   * Get transactions for a specific address using REST API
   * @param address - Contract address
   * @param limit - Number of transactions to fetch
   * @param lt - Logical time for pagination (fetch transactions before this lt)
   * @param hash - Transaction hash for pagination
   * @param toLt - Only fetch transactions with lt > toLt (newer than toLt)
   */
  async getTransactions(
    address: string,
    limit: number = 1,
    lt?: string,
    hash?: string,
    toLt?: string,
  ): Promise<Transaction[]> {
    try {
      // Use TonCenter REST API v2 format
      const url = `${this.endpoint}/getTransactions`;
      const params: any = {
        address: address,
        limit: limit,
      };

      // Pagination: fetch transactions before this lt
      if (lt) {
        params.lt = lt;
      }
      if (hash) {
        params.hash = hash;
      }

      // Filter: only fetch transactions after this lt
      if (toLt) {
        params.to_lt = toLt;
      }

      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      console.log(`Fetching transactions from: ${url}`, params);

      const response = await axios.get(url, {
        params,
        timeout: 30000,
      });

      if (!response.data || !response.data.ok || !response.data.result) {
        console.log("No transactions found in response:", response.data);
        return [];
      }

      const transactions = response.data.result;
      console.log(`Received ${transactions.length} transactions`);

      return transactions.map((tx: any) => {
        // Parse transaction data from TonCenter format
        const inMsg = tx.in_msg;
        const outMsgs = tx.out_msgs || [];

        return {
          hash: tx.transaction_id?.hash || tx.hash || "",
          lt: tx.transaction_id?.lt?.toString() || tx.lt?.toString() || "0",
          utime: tx.utime || tx.now || 0,
          inMsg:
            inMsg && inMsg.source
              ? {
                  source: inMsg.source || "",
                  destination: inMsg.destination || address,
                  value: inMsg.value || "0",
                  body: inMsg.body_hash || inMsg.message || "",
                }
              : undefined,
          outMsgs: outMsgs.map((msg: any) => ({
            source: msg.source || address,
            destination: msg.destination || "",
            value: msg.value || "0",
            body: msg.body_hash || msg.message || "",
          })),
        };
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching transactions for ${address}:`, errorMsg);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        console.error("Request URL:", error.config?.url);
      }
      return [];
    }
  }

  /**
   * Get latest transactions since a specific logical time (optimized)
   * Uses to_lt parameter to only fetch new transactions
   */
  async getTransactionsSince(
    address: string,
    sinceLt: string,
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let lastLt: string | undefined;
    let lastHash: string | undefined;

    console.log(`Fetching transactions since lt: ${sinceLt}`);

    while (true) {
      // Use to_lt parameter to only fetch transactions newer than sinceLt
      const txs = await this.getTransactions(
        address,
        this.batchSize,
        lastLt,
        lastHash,
        sinceLt, // to_lt parameter - only fetch tx with lt > sinceLt
      );

      if (txs.length === 0) {
        console.log("No more new transactions found");
        break;
      }

      console.log(`Fetched ${txs.length} new transactions`);

      // All returned transactions should be newer than sinceLt due to to_lt filter
      allTransactions.push(...txs);

      // If we got less than batch size, we've reached the end
      if (txs.length < this.batchSize) {
        console.log("Reached end of new transactions");
        break;
      }

      // Update pagination to fetch next batch
      const lastTx = txs[txs.length - 1];
      lastLt = lastTx.lt;
      lastHash = lastTx.hash;

      console.log(`Next pagination: lt=${lastLt}, hash=${lastHash}`);

      // Safety check: if the oldest transaction in this batch is not newer than sinceLt, stop
      if (BigInt(lastTx.lt) <= BigInt(sinceLt)) {
        console.log("Reached sinceLt boundary, stopping");
        break;
      }
    }

    console.log(`Total fetched: ${allTransactions.length} new transactions`);

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
   * Get account state and last transaction using REST API
   */
  async getAccountState(address: string): Promise<{
    balance: string;
    lastTransactionLt: string;
    lastTransactionHash: string;
  } | null> {
    try {
      // Use TonCenter REST API v2 format
      const url = `${this.endpoint}/getAddressInformation`;
      const params: any = {
        address: address,
      };

      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      const response = await axios.get(url, {
        params,
        timeout: 30000,
      });

      if (!response.data || !response.data.ok || !response.data.result) {
        return null;
      }

      const account = response.data.result;

      return {
        balance: account.balance?.toString() || "0",
        lastTransactionLt: account.last_transaction_id?.lt?.toString() || "0",
        lastTransactionHash: account.last_transaction_id?.hash || "",
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
   * Get endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }
}
