use anyhow::Result;
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub ton_config_url: String, // URL to TON global config (e.g. from ton-center)
    pub api_host: String,
    pub api_port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenv::dotenv().ok();

        Ok(Config {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            ton_config_url: env::var("TON_CONFIG_URL")
                .unwrap_or_else(|_| "https://ton.org/global.config.json".to_string()),
            api_host: env::var("API_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            api_port: env::var("API_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("API_PORT must be a valid number"),
        })
    }
}
