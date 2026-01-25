import { createApp } from "./app";
import { config, validateConfig } from "./config";
import { connectDatabase } from "./db/connection";
import { cacheService } from "./services/CacheService";
import { tonClientService } from "./services/ton/TonClientService";
import { factoryIndexer } from "./processes/indexer";

async function main() {
  console.log("Starting CoinNovac Backend (TypeScript)...");

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    console.warn("Configuration warning:", (error as Error).message);
  }

  // Connect to MongoDB
  console.log("Connecting to MongoDB...");
  await connectDatabase();

  // Connect to Redis
  console.log("Connecting to Redis...");
  try {
    await cacheService.connect();
  } catch (error) {
    console.warn("Redis connection failed, caching will be disabled:", error);
  }

  // Initialize TON client
  console.log("Initializing TON client...");
  try {
    await tonClientService.initialize();
  } catch (error) {
    console.warn("TON client initialization failed:", error);
  }

  // Start Factory Indexer (non-blocking)
  console.log("Starting Factory Indexer...");
  factoryIndexer.start().catch((error) => {
    console.warn("Factory indexer failed to start:", error);
  });

  // Create and start Express app
  const app = createApp();

  const host = config.apiHost;
  const port = config.apiPort;

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log("Ready to accept connections");
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await factoryIndexer.stop();
    await cacheService.disconnect();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  try {
    await factoryIndexer.stop();
    await cacheService.disconnect();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

// Run
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
