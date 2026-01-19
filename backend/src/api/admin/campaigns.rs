use super::{check_admin_role, get_current_user};
use crate::api::AppState;
use crate::db::Campaign;
use axum::{
    Json,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
};
use bigdecimal::BigDecimal;
use serde::Deserialize;
use std::str::FromStr;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateCampaignRequest {
    pub name: String,
    pub description: Option<String>,
    pub token_name: String,
    pub token_symbol: String,
    pub token_supply: String,
    pub logo_url: Option<String>,
    pub image_url: Option<String>,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: chrono::DateTime<chrono::Utc>,
    pub suggested_price: String, // Decimal as string
}

#[derive(Debug, Deserialize)]
pub struct UpdateCampaignStatusRequest {
    pub status: String,
}

pub async fn request_campaign(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<CreateCampaignRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    // Farmer or Admin can request
    let farmer_id = Uuid::from_str(&claims.sub).unwrap_or_default();

    let price = BigDecimal::from_str(&payload.suggested_price)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid price format".to_string()))?;

    let campaign = Campaign {
        id: Uuid::new_v4(),
        farmer_id,
        name: payload.name,
        description: payload.description,
        token_name: payload.token_name,
        token_symbol: payload.token_symbol,
        token_supply: payload.token_supply,
        logo_url: payload.logo_url,
        image_url: payload.image_url,
        start_time: payload.start_time,
        end_time: payload.end_time,
        suggested_price: price,
        status: "pending".to_string(),
        token_address: None,
        created_at: None,
        minted_at: None,
        mint_amount: None,
        mint_tx_hash: None,
    };

    let id = state
        .db
        .create_campaign(&campaign)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Invalidate campaigns list cache
    // We are invalidating a pattern for simplicity, as we cache by list params
    state.cache.invalidate_pattern("campaigns:list:*").await;

    Ok(Json(serde_json::json!({ "status": "created", "id": id })))
}

pub async fn list_campaigns(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<Vec<Campaign>>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;

    // Admin/Superadmin see all, Farmer sees only theirs
    let farmer_id_filter = if check_admin_role(&claims.role) {
        None
    } else {
        Some(Uuid::from_str(&claims.sub).unwrap_or_default())
    };

    // Construct cache key
    let cache_key = format!("campaigns:list:{:?}", farmer_id_filter);

    // Try to get from cache
    if let Some(cached) = state.cache.get_cached::<Vec<Campaign>>(&cache_key).await {
        return Ok(Json(cached));
    }

    let campaigns = state
        .db
        .list_campaigns(None, farmer_id_filter)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Set cache (TTL 60 seconds)
    state.cache.set_cached(&cache_key, &campaigns, 60).await;

    Ok(Json(campaigns))
}

pub async fn get_campaign(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<Campaign>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;

    let cache_key = format!("campaigns:id:{}", id);
    if let Some(cached) = state.cache.get_cached::<Campaign>(&cache_key).await {
        // Check ownership for cached campaigns too
        if !check_admin_role(&claims.role) {
            let user_id = Uuid::from_str(&claims.sub).unwrap_or_default();
            if cached.farmer_id != user_id {
                return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
            }
        }
        return Ok(Json(cached));
    }

    let campaign = state
        .db
        .get_campaign(id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Campaign not found".to_string()))?;

    // Check ownership: farmers can only see their own campaigns
    if !check_admin_role(&claims.role) {
        let user_id = Uuid::from_str(&claims.sub).unwrap_or_default();
        if campaign.farmer_id != user_id {
            return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
        }
    }

    state.cache.set_cached(&cache_key, &campaign, 300).await; // 5 min TTL for individual campaign

    Ok(Json(campaign))
}

pub async fn update_campaign_status(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateCampaignStatusRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    if !check_admin_role(&claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }

    state
        .db
        .update_campaign_status(id, &payload.status)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Invalidate specific campaign cache and lists
    state
        .cache
        .invalidate(&format!("campaigns:id:{}", id))
        .await;
    state.cache.invalidate_pattern("campaigns:list:*").await;

    let mut response_data = serde_json::Map::new();
    response_data.insert("status".to_string(), serde_json::json!("updated"));
    response_data.insert("new_status".to_string(), serde_json::json!(payload.status));

    if payload.status == "approved" {
        // Fetch campaign details to get token info
        let campaign = state
            .db
            .get_campaign(id)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((
                StatusCode::NOT_FOUND,
                "Campaign not found after update".to_string(),
            ))?;

        // Get farmer user info to get their TON address
        let farmer = state
            .db
            .get_user_by_id(campaign.farmer_id)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::NOT_FOUND, "Farmer not found".to_string()))?;

        // Parse token supply
        let supply: u128 = campaign.token_supply
            .parse()
            .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid token supply".to_string()))?;

        // Convert to nanocoins (multiply by 10^9)
        let supply_nanocoins = supply * 1_000_000_000;

        // Call Factory service to create campaign token
        let result = state
            .factory_service
            .create_campaign_token(
                &farmer.address,
                &campaign.token_name,
                &campaign.token_symbol,
                supply_nanocoins,
            )
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Token creation failed: {}", e),
                )
            })?;

        println!("Campaign approved! CreateJetton TX: {}", result.tx_hash);
        println!("Jetton address: {}", result.jetton_address);

        let token_address = result.jetton_address;
        let tx_hash = result.tx_hash;

        // Save token address and transaction info to database
        state
            .db
            .update_campaign_token_address(id, &token_address)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to save token address: {}", e),
                )
            })?;

        // Record the mint transaction
        state
            .db
            .update_campaign_mint_info(id, &supply.to_string(), Some(&tx_hash))
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to record mint info: {}", e),
                )
            })?;

        response_data.insert(
            "token_address".to_string(),
            serde_json::json!(token_address),
        );
        response_data.insert(
            "tx_hash".to_string(),
            serde_json::json!(tx_hash),
        );
    }

    Ok(Json(serde_json::Value::Object(response_data)))
}
