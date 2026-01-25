import { Request, Response } from "express";
import { factoryIndexer } from "../processes/indexer";
import { IndexedTransaction } from "../db/models/IndexedTransaction";

export class IndexerController {
  /**
   * Get indexer status
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await factoryIndexer.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get indexer status" });
    }
  }

  /**
   * Start indexer
   */
  static async start(req: Request, res: Response): Promise<void> {
    try {
      await factoryIndexer.start();
      res.json({ message: "Indexer started successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start indexer" });
    }
  }

  /**
   * Stop indexer
   */
  static async stop(req: Request, res: Response): Promise<void> {
    try {
      await factoryIndexer.stop();
      res.json({ message: "Indexer stopped successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop indexer" });
    }
  }

  /**
   * Reindex from specific LT
   */
  static async reindex(req: Request, res: Response): Promise<void> {
    try {
      const { lt } = req.body;

      if (!lt) {
        res.status(400).json({ error: "LT (logical time) is required" });
        return;
      }

      await factoryIndexer.reindexFrom(lt);
      res.json({ message: `Reindexing from LT: ${lt}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to reindex" });
    }
  }

  /**
   * Get indexed transactions
   */
  static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, eventType, processed } = req.query;

      const query: any = {};

      if (eventType) {
        query.eventType = eventType;
      }

      if (processed !== undefined) {
        query.processed = processed === "true";
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, total] = await Promise.all([
        IndexedTransaction.find(query)
          .sort({ lt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        IndexedTransaction.countDocuments(query),
      ]);

      res.json({
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  }

  /**
   * Get transaction by hash
   */
  static async getTransactionByHash(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { hash } = req.params;

      const transaction = await IndexedTransaction.findOne({ hash }).lean();

      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transaction" });
    }
  }
}
