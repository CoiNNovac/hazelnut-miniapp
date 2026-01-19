use crate::api::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json, Router,
    routing::get,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::{error, info};

#[derive(Debug, Serialize)]
pub struct TokenBalance {
    pub symbol: String,
    pub name: String,
    pub balance: String, // in tokens
    pub balance_nanocoins: String,
    pub token_address: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PortfolioResponse {
    pub user_address: String,
    pub mkoin_balance: TokenBalance,
    pub campaign_tokens: Vec<TokenBalance>,
    pub total_value_mkoin: Option<String>,
}

pub fn balances_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/balances/{address}", get(get_user_balances))
        .route("/balances/{address}/mkoin", get(get_mkoin_balance))
}

/// Get all balances for a user (MKOIN + campaign tokens)
///
/// GET /balances/:address
async fn get_user_balances(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Result<Json<PortfolioResponse>, (StatusCode, String)> {
    info!("Fetching balances for user {}", address);

    // Get MKOIN balance
    let mkoin_balance_nanocoins = match state.mkoin_service.get_balance(&address).await {
        Ok(balance) => balance,
        Err(e) => {
            error!("Failed to get MKOIN balance: {}", e);
            0 // Default to 0 if error
        }
    };

    let mkoin_balance_tokens = mkoin_balance_nanocoins as f64 / 1_000_000_000.0;

    let mkoin_balance = TokenBalance {
        symbol: "MKOIN".to_string(),
        name: "MKOIN Stablecoin".to_string(),
        balance: format!("{:.9}", mkoin_balance_tokens),
        balance_nanocoins: mkoin_balance_nanocoins.to_string(),
        token_address: Some("EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD".to_string()),
    };

    // Get campaign token balances from database (purchases)
    let campaign_tokens = match get_campaign_token_balances(&state, &address).await {
        Ok(tokens) => tokens,
        Err(e) => {
            error!("Failed to get campaign token balances: {}", e);
            vec![]
        }
    };

    // Calculate total value in MKOIN (sum of all balances)
    let total_value = mkoin_balance_tokens
        + campaign_tokens
            .iter()
            .filter_map(|t| t.balance.parse::<f64>().ok())
            .sum::<f64>();

    Ok(Json(PortfolioResponse {
        user_address: address,
        mkoin_balance,
        campaign_tokens,
        total_value_mkoin: Some(format!("{:.9}", total_value)),
    }))
}

/// Get MKOIN balance only
///
/// GET /balances/:address/mkoin
async fn get_mkoin_balance(
    State(state): State<Arc<AppState>>,
    Path(address): Path<String>,
) -> Result<Json<TokenBalance>, (StatusCode, String)> {
    info!("Fetching MKOIN balance for {}", address);

    match state.mkoin_service.get_balance(&address).await {
        Ok(balance_nanocoins) => {
            let balance_tokens = balance_nanocoins as f64 / 1_000_000_000.0;

            Ok(Json(TokenBalance {
                symbol: "MKOIN".to_string(),
                name: "MKOIN Stablecoin".to_string(),
                balance: format!("{:.9}", balance_tokens),
                balance_nanocoins: balance_nanocoins.to_string(),
                token_address: Some("EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD".to_string()),
            }))
        }
        Err(e) => {
            error!("Failed to get MKOIN balance: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get balance: {}", e),
            ))
        }
    }
}

/// Helper function to get campaign token balances from database
async fn get_campaign_token_balances(
    state: &Arc<AppState>,
    user_address: &str,
) -> Result<Vec<TokenBalance>, anyhow::Error> {
    // Get user's purchases from database
    let purchases = state.db.get_user_purchases(user_address).await?;

    // Get campaigns for these purchases
    let mut token_balances: std::collections::HashMap<String, (String, f64)> = std::collections::HashMap::new();

    for purchase in purchases {
        // Get campaign details
        if let Ok(Some(campaign)) = state.db.get_campaign(purchase.campaign_id).await {
            let tokens_received = purchase.tokens_received.to_string().parse::<f64>().unwrap_or(0.0);
            let tokens_received_mkoin = tokens_received / 1_000_000_000.0;

            let entry = token_balances
                .entry(campaign.token_symbol.clone())
                .or_insert((campaign.token_name.clone(), 0.0));
            entry.1 += tokens_received_mkoin;
        }
    }

    // Convert to TokenBalance vec
    let balances: Vec<TokenBalance> = token_balances
        .into_iter()
        .map(|(symbol, (name, balance))| TokenBalance {
            symbol,
            name,
            balance: format!("{:.9}", balance),
            balance_nanocoins: ((balance * 1_000_000_000.0) as u128).to_string(),
            token_address: None, // TODO: Get from campaign
        })
        .collect();

    Ok(balances)
}
