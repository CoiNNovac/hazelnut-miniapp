use anyhow::Result;
use redis::{Client, AsyncCommands};
use std::sync::Once;
use sqlx::postgres::PgPoolOptions;
use web_app::config::Config;
use web_app::db::Database;
use web_app::cache::CacheService;

static INIT: Once = Once::new();

pub async fn setup() -> (Database, CacheService) {
    INIT.call_once(|| {
        dotenv::dotenv().ok();
        tracing_subscriber::fmt::init();
    });

    let config = Config::from_env().expect("Failed to load config");
    
    // For tests, we might want a separate DB or just use the dev one carefully.
    // Ideally, we'd create a new DB for each test run or use transactions, but for now we use the configured one.
    
    let db = Database::new(&config.database_url).await.expect("Failed to connect to DB");
    let cache = CacheService::new(&config.redis_url).expect("Failed to connect to Redis");

    // Clean DB? Or assume tests clean up? 
    // Let's just run migrations to be sure schema is up to date.
    // Update: Skipping migration in test to avoid VersionMismatch errors if local files changed hash.
    // We assume ./run_migrations.sh has been run.
    // sqlx::migrate!("./migrations").run(&db.pool).await.expect("Failed to run migrations");

    (db, cache)
}
