import { config } from "../config";
import { TonCrawler, Transaction } from "../utils/tonCrawler";
import { IndexedTransaction } from "../db/models/IndexedTransaction";
import { IndexerState } from "../db/models/IndexerState";
import { Campaign } from "../db/models/Campaign";
import { Address, Cell, Slice } from "@ton/core";

export class FactoryIndexer {
  private crawler: TonCrawler;
  private factoryAddress: string;
  private isRunning: boolean = false;
  private pollInterval: number = 15000; // 15 seconds

  constructor() {
    this.factoryAddress = config.factoryAddress;
    this.crawler = new TonCrawler({
      endpoint: config.tonEndpoint,
      apiKey: config.tonApiKey,
      pollInterval: this.pollInterval,
    });
  }

  /**
   * Start the indexer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("Indexer is already running");
      return;
    }

    console.log(`Starting Factory Indexer for ${this.factoryAddress}...`);
    this.isRunning = true;

    // Get or create indexer state
    let state = await IndexerState.findOne({
      contractAddress: this.factoryAddress,
    });

    if (!state) {
      // First time running - get initial state
      const accountState = await this.crawler.getAccountState(
        this.factoryAddress,
      );

      state = await IndexerState.create({
        contractAddress: this.factoryAddress,
        lastProcessedLt: accountState?.lastTransactionLt || "0",
        lastProcessedHash: accountState?.lastTransactionHash || "",
        lastProcessedTime: new Date(),
        isRunning: true,
      });

      console.log(
        `Initialized indexer state from LT: ${state.lastProcessedLt}`,
      );
    } else {
      state.isRunning = true;
      await state.save();
      console.log(`Resuming from LT: ${state.lastProcessedLt}`);
    }

    // Start processing
    await this.processLoop(state.lastProcessedLt);
  }

  /**
   * Stop the indexer
   */
  async stop(): Promise<void> {
    console.log("Stopping Factory Indexer...");
    this.isRunning = false;

    await IndexerState.updateOne(
      { contractAddress: this.factoryAddress },
      { isRunning: false },
    );
  }

  /**
   * Main processing loop
   */
  private async processLoop(fromLt: string): Promise<void> {
    let lastLt = fromLt;

    while (this.isRunning) {
      try {
        // Get new transactions
        const newTxs = await this.crawler.getTransactionsSince(
          this.factoryAddress,
          lastLt,
        );

        if (newTxs.length > 0) {
          console.log(`Found ${newTxs.length} new transactions`);

          // Process transactions in order (oldest first)
          for (const tx of newTxs.reverse()) {
            await this.processTransaction(tx);
            lastLt = tx.lt;

            // Update state after each transaction
            await IndexerState.updateOne(
              { contractAddress: this.factoryAddress },
              {
                lastProcessedLt: lastLt,
                lastProcessedHash: tx.hash,
                lastProcessedTime: new Date(),
              },
            );
          }
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Error in indexer loop: ${errorMsg}`);
        await new Promise((resolve) =>
          setTimeout(resolve, this.pollInterval * 2),
        );
      }
    }
  }

  /**
   * Process a single transaction
   */
  private async processTransaction(tx: Transaction): Promise<void> {
    try {
      // Check if already processed
      const existing = await IndexedTransaction.findOne({ hash: tx.hash });
      if (existing) {
        console.log(`Transaction ${tx.hash} already processed`);
        return;
      }

      // Parse transaction to detect event type
      const eventType = this.detectEventType(tx);
      const parsedData = await this.parseTransactionData(tx, eventType);

      // Save to database
      await IndexedTransaction.create({
        hash: tx.hash,
        lt: tx.lt,
        utime: tx.utime,
        contractAddress: this.factoryAddress,
        inMsg: tx.inMsg,
        outMsgs: tx.outMsgs,
        eventType,
        parsedData,
        processed: false,
      });

      console.log(`Indexed transaction ${tx.hash} - Event: ${eventType}`);

      // Process event-specific logic
      await this.handleEvent(tx, eventType, parsedData);

      // Mark as processed
      await IndexedTransaction.updateOne(
        { hash: tx.hash },
        { processed: true },
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error processing transaction ${tx.hash}: ${errorMsg}`);
    }
  }

  /**
   * Detect event type from transaction
   */
  private detectEventType(tx: Transaction): string {
    // Check outgoing messages for event patterns
    if (tx.outMsgs.length > 0) {
      // If factory sends a message, it's likely creating a jetton
      return "jetton_created";
    }

    if (tx.inMsg) {
      // Incoming message patterns
      const source = tx.inMsg.source;
      const value = BigInt(tx.inMsg.value || "0");

      if (value > 0) {
        return "create_jetton_request";
      }
    }

    return "unknown";
  }

  /**
   * Parse transaction data based on event type
   */
  private async parseTransactionData(
    tx: Transaction,
    eventType: string,
  ): Promise<any> {
    try {
      if (eventType === "jetton_created" && tx.outMsgs.length > 0) {
        // Extract jetton address from outgoing messages
        const jettonMsg = tx.outMsgs[0];

        return {
          jettonAddress: jettonMsg.destination,
          creator: tx.inMsg?.source,
          timestamp: tx.utime,
          value: jettonMsg.value,
        };
      }

      if (eventType === "create_jetton_request" && tx.inMsg) {
        return {
          creator: tx.inMsg.source,
          value: tx.inMsg.value,
          timestamp: tx.utime,
        };
      }

      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error parsing transaction data: ${errorMsg}`);
      return null;
    }
  }

  /**
   * Handle event-specific logic
   */
  private async handleEvent(
    tx: Transaction,
    eventType: string,
    parsedData: any,
  ): Promise<void> {
    try {
      if (eventType === "jetton_created" && parsedData?.jettonAddress) {
        // Update campaign with the created jetton address
        const campaign = await Campaign.findOne({
          creatorAddress: parsedData.creator,
          status: "pending",
        }).sort({ createdAt: -1 });

        if (campaign) {
          campaign.tokenAddress = parsedData.jettonAddress;
          campaign.status = "pending" as any; // Update based on your CampaignStatus enum
          await campaign.save();

          console.log(
            `Updated campaign ${campaign._id} with jetton address ${parsedData.jettonAddress}`,
          );
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error handling event: ${errorMsg}`);
    }
  }

  /**
   * Get indexer status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    lastProcessedLt: string;
    lastProcessedTime: Date | null;
    totalIndexed: number;
    pendingProcessing: number;
  }> {
    const state = await IndexerState.findOne({
      contractAddress: this.factoryAddress,
    });

    const totalIndexed = await IndexedTransaction.countDocuments({
      contractAddress: this.factoryAddress,
    });

    const pendingProcessing = await IndexedTransaction.countDocuments({
      contractAddress: this.factoryAddress,
      processed: false,
    });

    return {
      isRunning: state?.isRunning || false,
      lastProcessedLt: state?.lastProcessedLt || "0",
      lastProcessedTime: state?.lastProcessedTime || null,
      totalIndexed,
      pendingProcessing,
    };
  }

  /**
   * Reindex from a specific logical time
   */
  async reindexFrom(lt: string): Promise<void> {
    console.log(`Reindexing from LT: ${lt}`);

    await IndexerState.updateOne(
      { contractAddress: this.factoryAddress },
      {
        lastProcessedLt: lt,
        lastProcessedHash: "",
        lastProcessedTime: new Date(),
      },
      { upsert: true },
    );

    if (this.isRunning) {
      await this.stop();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.start();
    }
  }
}

// Singleton instance
export const factoryIndexer = new FactoryIndexer();
