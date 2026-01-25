import dotenv from "dotenv";

dotenv.config();

export const config = {
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/coinnovac",

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // API Server
  apiHost: process.env.API_HOST || "0.0.0.0",
  apiPort: parseInt(process.env.API_PORT || "8080", 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET || "development-secret-key",
  jwtExpiresIn: "24h",

  // TON Blockchain
  tonEndpoint:
    process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  tonApiKey: process.env.TON_API_KEY,

  // Admin Wallet
  adminMnemonic: process.env.ADMIN_MNEMONIC || "",

  // Contract Addresses
  mkoinAddress:
    process.env.MKOIN_ADDRESS ||
    "EQATDLvt8bY8BGb-DGBZxwe6EZla3Rcij41fqv_OFlLXvgpV",
  factoryAddress:
    process.env.FACTORY_ADDRESS ||
    "EQBY-OWwam2n7DO25xV7juUWS9MV9xjJ1bwL1dISkYDNcGP2",

  // MKOIN Token Settings
  mkoinDecimals: parseInt(process.env.MKOIN_DECIMALS || "9", 10), // MKOIN uses 9 decimals (like EUR)
};

export function validateConfig(): void {
  const requiredVars = ["MONGODB_URI", "JWT_SECRET", "ADMIN_MNEMONIC"];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
