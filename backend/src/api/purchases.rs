use crate::api::AppState;
use crate::db::Purchase;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreatePurchaseRequest {
    pub campaign_id: Uuid,
    pub mkoin_paid: String,
    pub tokens_received: String,
    pub tx_hash: String,
}

#[derive(Debug, Serialize)]
pub struct PurchaseResponse {
    pub id: Uuid,
    pub status: String,
    pub message: String,
}

// Helper to extract user address from headers
fn get_user_address(headers: &HeaderMap) -> Result<String, (StatusCode, String)> {
    headers
        .get("X-User-Address")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .ok_or((
            StatusCode::BAD_REQUEST,
            "Missing X-User-Address header".to_string(),
        ))
}

pub async fn create_purchase(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<CreatePurchaseRequest>,
) -> Result<Json<PurchaseResponse>, (StatusCode, String)> {
    // Get user address from header
    let user_address = get_user_address(&headers)?;

    // Verify campaign exists and is active
    let campaign = state
        .db
        .get_campaign(payload.campaign_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Campaign not found".to_string()))?;

    // Check campaign status
    if campaign.status != "approved" && campaign.status != "running" {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Campaign is not active. Status: {}", campaign.status),
        ));
    }

    // Record purchase in database
    let purchase_id = state
        .db
        .create_purchase(
            &user_address,
            payload.campaign_id,
            &payload.mkoin_paid,
            &payload.tokens_received,
            &payload.tx_hash,
        )
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to create purchase: {}", e),
            )
        })?;

    // Update portfolio balance
    let token_address = campaign
        .token_address
        .unwrap_or_else(|| "0:00d2042b5a38fa538142608b0c87eaab75780684ca2313066dbc693c954253c9".to_string());

    state
        .db
        .upsert_portfolio(
            &user_address,
            &token_address,
            &payload.tokens_received,
            0, // lt will be updated by indexer
        )
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to update portfolio: {}", e),
            )
        })?;

    // Invalidate cache
    state
        .cache
        .invalidate(&format!("portfolio:{}", user_address))
        .await;
    state
        .cache
        .invalidate(&format!("campaign:stats:{}", payload.campaign_id))
        .await;

    Ok(Json(PurchaseResponse {
        id: purchase_id,
        status: "success".to_string(),
        message: "Purchase recorded. Awaiting blockchain confirmation.".to_string(),
    }))
}

pub async fn get_user_purchases(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<Vec<Purchase>>, (StatusCode, String)> {
    let user_address = get_user_address(&headers)?;

    let purchases = state
        .db
        .get_user_purchases(&user_address)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(purchases))
}

pub async fn get_campaign_purchases_handler(
    State(state): State<Arc<AppState>>,
    Path(campaign_id): Path<Uuid>,
) -> Result<Json<Vec<Purchase>>, (StatusCode, String)> {
    let cache_key = format!("campaign:purchases:{}", campaign_id);

    // Try cache first
    if let Some(cached) = state.cache.get_cached::<Vec<Purchase>>(&cache_key).await {
        return Ok(Json(cached));
    }

    let purchases = state
        .db
        .get_campaign_purchases(campaign_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Cache for 30 seconds
    state.cache.set_cached(&cache_key, &purchases, 30).await;

    Ok(Json(purchases))
}

pub async fn get_campaign_stats_handler(
    State(state): State<Arc<AppState>>,
    Path(campaign_id): Path<Uuid>,
) -> Result<Json<crate::db::CampaignStats>, (StatusCode, String)> {
    let cache_key = format!("campaign:stats:{}", campaign_id);

    // Try cache first
    if let Some(cached) = state
        .cache
        .get_cached::<crate::db::CampaignStats>(&cache_key)
        .await
    {
        return Ok(Json(cached));
    }

    let stats = state
        .db
        .get_campaign_stats(campaign_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Cache for 60 seconds
    state.cache.set_cached(&cache_key, &stats, 60).await;

    Ok(Json(stats))
}

pub fn purchases_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/purchases", post(create_purchase))
        .route("/purchases/my", get(get_user_purchases))
        .route(
            "/campaigns/{campaign_id}/purchases",
            get(get_campaign_purchases_handler),
        )
        .route(
            "/campaigns/{campaign_id}/stats",
            get(get_campaign_stats_handler),
        )
}
