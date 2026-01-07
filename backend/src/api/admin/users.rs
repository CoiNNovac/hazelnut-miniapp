use crate::api::AppState;
use crate::auth;
use crate::db::User;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;
use super::{get_current_user, check_admin_role}; // Import helpers from parent mod

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub role: String, // 'admin', 'farmer'
    pub address: String, // Optional?
    pub name: Option<String>,
}

pub async fn list_users(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<Vec<User>>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    if !check_admin_role(&claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }

    let cache_key = "users:list:all";
    if let Some(cached) = state.cache.get_cached::<Vec<User>>(cache_key).await {
        return Ok(Json(cached));
    }

    let users = state.db.list_users(None).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
    state.cache.set_cached(cache_key, &users, 60).await; // 1 min cache

    Ok(Json(users))
}

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    if !check_admin_role(&claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }

    let hash = auth::hash_password(&payload.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let id = state.db.create_user_full(
        &payload.username,
        &hash,
        &payload.role,
        &payload.address,
        payload.name.as_deref(),
    ).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Invalidate users list
    state.cache.invalidate("users:list:all").await;

    Ok(Json(serde_json::json!({ "status": "created", "id": id })))
}

pub async fn disable_user(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    if !check_admin_role(&claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }

    state.db.set_user_disabled(id, true).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Invalidate users list
    state.cache.invalidate("users:list:all").await;

    Ok(Json(serde_json::json!({ "status": "disabled" })))
}

pub async fn delete_user(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let claims = get_current_user(&headers).await?;
    if !check_admin_role(&claims.role) {
        return Err((StatusCode::FORBIDDEN, "Access denied".to_string()));
    }

    state.db.delete_user(id).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Invalidate users list
    state.cache.invalidate("users:list:all").await;

    Ok(Json(serde_json::json!({ "status": "deleted" })))
}
