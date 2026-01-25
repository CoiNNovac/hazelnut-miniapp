import Redis from "ioredis";
import { config } from "../config";

export class CacheService {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    await this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Cache key generators
  static keys = {
    portfolio: (address: string) => `portfolio:${address}`,
    campaignList: (filter: string) => `campaigns:list:${filter}`,
    campaign: (id: string) => `campaigns:id:${id}`,
    userList: () => "users:list:all",
    user: (id: string) => `users:id:${id}`,
    campaignStats: (id: string) => `campaign:stats:${id}`,
    mkoinTotalSupply: () => "mkoin:total-supply",
    mkoinBalance: (address: string) => `mkoin:balance:${address}`,
  };

  // Cache TTLs in seconds
  static ttl = {
    portfolio: 30,
    campaignList: 60,
    campaign: 300,
    userList: 60,
    campaignStats: 60,
    mkoinTotalSupply: 30,
    mkoinBalance: 30,
  };
}

export const cacheService = new CacheService();
