use crate::api::AppState;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json, Router,
    routing::{get, post},
};
use bigdecimal::BigDecimal;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::Arc;
use tracing::{error, info};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct MintMkoinRequest {
    pub recipient: String,
    pub amount: String, // in MKOIN (will be converted to nanocoins)
}

#[derive(Debug, Serialize)]
pub struct MintMkoinResponse {
    pub success: bool,
    pub tx_hash: Option<String>,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct BalanceResponse {
    pub address: String,
    pub balance: String, // in MKOIN
    pub balance_nanocoins: String,
}

#[derive(Debug, Serialize)]
pub struct TotalSupplyResponse {
    pub total_supply: String, // in MKOIN
    pub total_supply_nanocoins: String,
}

#[derive(Debug, Serialize)]
pub struct MintHistoryItem {
    pub id: String,
    pub recipient_address: String,
    pub amount: String, // in MKOIN
    pub tx_hash: Option<String>,
    pub status: String,
    pub minted_at: String,
    pub confirmed_at: Option<String>,
}

pub fn mkoin_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/admin/mkoin/mint", post(mint_mkoin))
        .route("/admin/mkoin/balance/{address}", get(get_balance))
        .route("/admin/mkoin/total-supply", get(get_total_supply))
        .route("/admin/mkoin/history", get(get_mint_history))
}

/// Mint MKOIN to a recipient address
///
/// POST /admin/mkoin/mint
/// Body: { "recipient": "EQ...", "amount": "100" }
async fn mint_mkoin(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<MintMkoinRequest>,
) -> Result<Json<MintMkoinResponse>, (StatusCode, String)> {
    info!("Minting {} MKOIN to {}", req.amount, req.recipient);

    // Get current user from JWT
    let claims = super::super::admin::get_current_user(&headers).await?;
    let admin_id = Uuid::from_str(&claims.sub).map_err(|_| {
        (StatusCode::INTERNAL_SERVER_ERROR, "Invalid user ID".to_string())
    })?;

    // Parse amount (in MKOIN) to nanocoins
    let amount_mkoin: f64 = req
        .amount
        .parse()
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid amount format".to_string()))?;

    if amount_mkoin <= 0.0 {
        return Err((
            StatusCode::BAD_REQUEST,
            "Amount must be greater than 0".to_string(),
        ));
    }

    // Convert MKOIN to nanocoins (1 MKOIN = 1_000_000_000 nanocoins)
    let amount_nanocoins = (amount_mkoin * 1_000_000_000.0) as u128;
    let amount_bd = BigDecimal::from_str(&amount_nanocoins.to_string())
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Amount conversion error".to_string()))?;

    // Call minting service
    match state.mkoin_service.mint_mkoin(&req.recipient, amount_nanocoins).await {
        Ok(tx_hash) => {
            info!("Successfully minted {} MKOIN to {}. TX: {}", amount_mkoin, req.recipient, tx_hash);

            // Record mint in database
            if let Err(e) = state.db.record_mkoin_mint(
                &req.recipient,
                &amount_bd,
                &tx_hash,
                Some(admin_id),
                "confirmed"
            ).await {
                error!("Failed to record mint in database: {}", e);
                // Continue anyway - the blockchain transaction succeeded
            }

            Ok(Json(MintMkoinResponse {
                success: true,
                tx_hash: Some(tx_hash),
                message: format!("Successfully minted {} MKOIN", amount_mkoin),
            }))
        }
        Err(e) => {
            error!("Failed to mint MKOIN: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Minting failed: {}", e),
            ))
        }
    }
}

/// Get MKOIN balance for an address
///
/// GET /admin/mkoin/balance/:address
async fn get_balance(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Result<Json<BalanceResponse>, (StatusCode, String)> {
    info!("Fetching MKOIN balance for {}", address);

    match state.mkoin_service.get_balance(&address).await {
        Ok(balance_nanocoins) => {
            let balance_mkoin = balance_nanocoins as f64 / 1_000_000_000.0;

            Ok(Json(BalanceResponse {
                address,
                balance: format!("{:.9}", balance_mkoin),
                balance_nanocoins: balance_nanocoins.to_string(),
            }))
        }
        Err(e) => {
            error!("Failed to get balance: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get balance: {}", e),
            ))
        }
    }
}

/// Get total MKOIN supply
///
/// GET /admin/mkoin/total-supply
async fn get_total_supply(
    State(state): State<Arc<AppState>>,
) -> Result<Json<TotalSupplyResponse>, (StatusCode, String)> {
    info!("Fetching MKOIN total supply");

    match state.mkoin_service.get_total_supply().await {
        Ok(supply_nanocoins) => {
            let supply_mkoin = supply_nanocoins as f64 / 1_000_000_000.0;

            Ok(Json(TotalSupplyResponse {
                total_supply: format!("{:.9}", supply_mkoin),
                total_supply_nanocoins: supply_nanocoins.to_string(),
            }))
        }
        Err(e) => {
            error!("Failed to get total supply: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get total supply: {}", e),
            ))
        }
    }
}

/// Get MKOIN minting history
///
/// GET /admin/mkoin/history
async fn get_mint_history(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<Vec<MintHistoryItem>>, (StatusCode, String)> {
    info!("Fetching MKOIN mint history");

    // Verify admin authentication
    let _claims = super::super::admin::get_current_user(&headers).await?;

    match state.db.get_mkoin_mints(Some(100)).await {
        Ok(mints) => {
            let history: Vec<MintHistoryItem> = mints
                .into_iter()
                .map(|mint| {
                    let amount_nanocoins = mint.amount.to_string().parse::<f64>().unwrap_or(0.0);
                    let amount_mkoin = amount_nanocoins / 1_000_000_000.0;

                    MintHistoryItem {
                        id: mint.id.to_string(),
                        recipient_address: mint.recipient_address,
                        amount: format!("{:.9}", amount_mkoin),
                        tx_hash: mint.tx_hash,
                        status: mint.status,
                        minted_at: mint.minted_at.to_rfc3339(),
                        confirmed_at: mint.confirmed_at.map(|dt| dt.to_rfc3339()),
                    }
                })
                .collect();

            Ok(Json(history))
        }
        Err(e) => {
            error!("Failed to get mint history: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get mint history: {}", e),
            ))
        }
    }
}
