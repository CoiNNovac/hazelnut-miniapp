use crate::api::AppState;
use crate::auth;
use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

// --- DTOs ---

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserDto,
}

#[derive(Debug, Serialize)]
pub struct UserDto {
    pub id: Uuid,
    pub username: Option<String>,
    pub role: String,
    pub address: String,
}

#[derive(Debug, Deserialize)]
pub struct WalletLoginRequest {
    pub address: String,
    pub proof: Option<String>, 
}

// --- Handlers ---

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, String)> {
    let user_opt = state.db.get_user_by_username(&payload.username).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = user_opt.ok_or((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    if let Some(hash) = &user.password_hash {
        if !auth::verify_password(&payload.password, hash).unwrap_or(false) {
             return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
        }
    } else {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    if user.is_disabled.unwrap_or(false) {
        return Err((StatusCode::FORBIDDEN, "Account disabled".to_string()));
    }

    let token = auth::create_jwt(user.id, &user.username.clone().unwrap_or_default(), &user.role)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(LoginResponse {
        token,
        user: UserDto {
            id: user.id,
            username: user.username,
            role: user.role,
            address: user.address,
        }
    }))
}

pub async fn wallet_login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<WalletLoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, String)> {
    let user = state.db.get_user_by_address(&payload.address).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = if let Some(u) = user {
        u
    } else {
        let id = state.db.create_user(&payload.address, "farmer", None).await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        state.db.get_user_by_id(id).await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch created user".to_string()))?
    };

    if user.is_disabled.unwrap_or(false) {
        return Err((StatusCode::FORBIDDEN, "Account disabled".to_string()));
    }

    let token = auth::create_jwt(user.id, &user.username.clone().unwrap_or(user.address.clone()), &user.role)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(LoginResponse {
        token,
        user: UserDto {
            id: user.id,
            username: user.username,
            role: user.role,
            address: user.address,
        }
    }))
}

// Helper to check admin role (shared if needed, but better in a shared util or middleware)
// For now, keeping logic minimal or duplicating the check helper if simple.
// But wait, the handlers in other files need `get_current_user` and `check_admin_role`.
// We should put those shared helpers in `mod.rs` of admin or a common place.
