use anyhow::Result;
use dotenv::dotenv;
use tracing::{error, info};

mod api;
mod config;
mod db;
mod ton;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    dotenv().ok();

    info!("Starting TON Portfolio Indexer...");

    let config = config::Config::from_env()?;
    let db = db::Database::new(&config.database_url).await?;

    // Run migrations
    sqlx::migrate!("./migrations").run(&db.pool).await?;

    // Start Indexer in background
    let db_clone = db.clone();
    let indexer_handle = tokio::spawn(async move {
        let indexer = ton::indexer::Indexer::new(db_clone).await.unwrap();
        if let Err(e) = indexer.run().await {
            error!("Indexer failed: {}", e);
        }
    });

    // Start API Server
    let app = api::router(db);
    let addr = format!("{}:{}", config.api_host, config.api_port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    info!("API Server running on {}", addr);

    // Run both
    tokio::select! {
        _ = axum::serve(listener, app) => {},
        _ = indexer_handle => {}
    }

    Ok(())
}
