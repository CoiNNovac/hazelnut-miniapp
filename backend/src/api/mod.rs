use crate::db::Database;
use anyhow::Result;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// Core Data Structures
#[derive(Debug, Serialize, Deserialize)]
pub struct PortfolioItem {
    pub token_address: String,
    pub symbol: String,
    pub balance: String,
    pub usd_value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    pub address: String,
    pub name: Option<String>,
    pub role: String, // 'farmer', 'admin', 'superadmin'
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MintRequest {
    pub token_address: String,
    pub amount: String,
    pub recipient: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeployRequest {
    pub name: String,
    pub symbol: String,
    pub max_supply: String,
    pub price: String,
    pub metadata_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DistributionRequest {
    pub target_token: String,
    pub amount_mkoin: String,
}

pub struct AppState {
    pub db: Database,
}

pub fn router(db: Database) -> Router {
    let state = Arc::new(AppState { db });

    Router::new()
        .route("/portfolio/{user_address}", get(get_user_portfolio))
        // Public/Protected User Routes
        .route("/users/register", post(register_user))
        // Admin Routes
        .route("/admin/tokens/mint", post(admin_mint_token))
        .route("/admin/tokens/burn", post(admin_burn_token))
        .route("/admin/tokens/deploy", post(admin_deploy_token))
        .route("/admin/distribution", post(admin_distribute_rewards))
        .with_state(state)
}

// Helper: Check if requester is Admin
async fn ensure_admin(headers: &HeaderMap, db: &Database) -> Result<(), (StatusCode, String)> {
    // For MVP, identity is passed via X-User-Identity header
    let user_address = headers
        .get("X-User-Identity")
        .and_then(|v| v.to_str().ok())
        .ok_or((
            StatusCode::UNAUTHORIZED,
            "Missing identity header".to_string(),
        ))?;

    let role = db
        .get_user_role(user_address)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::FORBIDDEN, "User not found".to_string()))?;

    if role != "admin" && role != "superadmin" {
        return Err((
            StatusCode::FORBIDDEN,
            "Insufficient permissions".to_string(),
        ));
    }
    Ok(())
}

async fn register_user(
    State(state): State<Arc<AppState>>,
    _headers: HeaderMap,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // Simple logic: if registering 'admin'/'superadmin', requester must be superadmin
    if payload.role == "admin" || payload.role == "superadmin" {
        // strict check disabled for initial bootstrap but structure is here
        // ensure_admin(&headers, &state.db).await?;
    }

    let id = state
        .db
        .create_user(&payload.address, &payload.role, payload.name.as_deref())
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to create user: {}", e),
            )
        })?;

    Ok(Json(
        serde_json::json!({ "status": "created", "id": id.to_string() }),
    ))
}

async fn get_user_portfolio(
    State(_state): State<Arc<AppState>>,
    Path(_user_address): Path<String>,
) -> Json<Vec<PortfolioItem>> {
    Json(vec![
        PortfolioItem {
            token_address: "EQ...AgriToken".to_string(),
            symbol: "AGRI".to_string(),
            balance: "100.50".to_string(),
            usd_value: Some(100.50),
        },
        PortfolioItem {
            token_address: "EQ...MKOIN".to_string(),
            symbol: "MKOIN".to_string(),
            balance: "500.00".to_string(),
            usd_value: Some(500.00),
        },
    ])
}

async fn admin_mint_token(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<MintRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    ensure_admin(&headers, &state.db).await?;

    Ok(Json(
        serde_json::json!({ "status": "ok", "action": "mint", "amount": payload.amount }),
    ))
}

async fn admin_burn_token(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<MintRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    ensure_admin(&headers, &state.db).await?;
    Ok(Json(
        serde_json::json!({ "status": "ok", "action": "burn", "amount": payload.amount }),
    ))
}

async fn admin_deploy_token(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<DeployRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    ensure_admin(&headers, &state.db).await?;
    Ok(Json(serde_json::json!({
        "status": "ok",
        "contract_address": "EQ_NEW_TOKEN_ADDRESS",
        "symbol": payload.symbol
    })))
}

async fn admin_distribute_rewards(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<DistributionRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    ensure_admin(&headers, &state.db).await?;
    Ok(Json(serde_json::json!({
        "status": "ok",
        "distributed_mkoin": payload.amount_mkoin,
        "recipient_count": 42
    })))
}
