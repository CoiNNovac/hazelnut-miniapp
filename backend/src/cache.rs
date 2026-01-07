use anyhow::Result;
use redis::{Client, AsyncCommands};
use serde::{de::DeserializeOwned, Serialize};
use std::time::Duration;
use tracing::{error, info};

#[derive(Clone)]
pub struct CacheService {
    client: Client,
}

impl CacheService {
    pub fn new(redis_url: &str) -> Result<Self> {
        let client = Client::open(redis_url)?;
        Ok(Self { client })
    }

    pub async fn get_cached<T>(&self, key: &str) -> Option<T>
    where
        T: DeserializeOwned,
    {
        let mut conn = match self.client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => {
                error!("Redis connection failed: {}", e);
                return None;
            }
        };

        let result: Result<String, _> = conn.get(key).await;
        match result {
            Ok(json_str) => match serde_json::from_str(&json_str) {
                Ok(val) => Some(val),
                Err(e) => {
                    error!("Failed to deserialize cache for {}: {}", key, e);
                    None
                }
            },
            Err(e) => {
                // Key not found or other error
                // error!("Redis get failed for {}: {}", key, e); 
                // Don't log on every miss if it's just missing
                None
            }
        }
    }

    pub async fn set_cached<T>(&self, key: &str, value: &T, ttl_seconds: u64)
    where
        T: Serialize,
    {
        let mut conn = match self.client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => {
                error!("Redis connection failed: {}", e);
                return;
            }
        };

        let json_str = match serde_json::to_string(value) {
            Ok(s) => s,
            Err(e) => {
                error!("Failed to serialize value for {}: {}", key, e);
                return;
            }
        };

        let result: Result<(), _> = conn.set_ex(key, json_str, ttl_seconds).await;
        if let Err(e) = result {
            error!("Redis set failed for {}: {}", key, e);
        }
    }

    pub async fn invalidate(&self, pattern: &str) {
        let mut conn = match self.client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => {
                error!("Redis connection failed: {}", e);
                return;
            }
        };
        
        // This is a simplified invalidation using KEYS which is not recommended for production large datasets
        // but fine for this scale. For better pattern, use SCAN.
        // Or just explicit keys.
        // For now, let's just delete exact key if pattern has no wildcards, 
        // or support wildcards if needed.
        // Actually, let's just expose a `del` method.
        
        let _: Result<(), _> = conn.del(pattern).await;
    }
    
    // Helper to clear multiple keys by pattern (simple implementation)
    pub async fn invalidate_pattern(&self, pattern: &str) {
         let mut conn = match self.client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => {
                error!("Redis connection failed: {}", e);
                return;
            }
        };
        
        let keys: Vec<String> = match conn.keys(pattern).await {
            Ok(k) => k,
            Err(_) => return,
        };
        
        if !keys.is_empty() {
             let _: Result<(), _> = conn.del(keys).await;
        }
    }
}
