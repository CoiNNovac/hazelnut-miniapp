use crate::api::AppState;
use crate::auth as app_auth;
use axum::{
    routing::{get, post, put, delete},
    Router,
    http::{HeaderMap, StatusCode},
};
use std::sync::Arc;

pub mod auth;
pub mod users;
pub mod campaigns;

pub fn admin_routes(_db: crate::db::Database) -> Router<Arc<AppState>> {
     Router::new()
        .route("/auth/login", post(auth::login))
        .route("/auth/wallet", post(auth::wallet_login))
        .route("/admin/users", get(users::list_users).post(users::create_user))
        .route("/admin/users/{id}/disable", put(users::disable_user))
        .route("/admin/users/{id}", delete(users::delete_user))
        .route("/campaigns", get(campaigns::list_campaigns).post(campaigns::request_campaign))
        .route("/campaigns/{id}", get(campaigns::get_campaign))
        .route("/campaigns/{id}/status", put(campaigns::update_campaign_status))
}

// --- Shared Helpers ---

pub fn check_admin_role(role: &str) -> bool {
    role == "admin" || role == "superadmin"
}

pub async fn get_current_user(headers: &HeaderMap) -> Result<app_auth::Claims, (StatusCode, String)> {
    let auth_header = headers.get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
         return Err((StatusCode::UNAUTHORIZED, "Invalid Authorization header".to_string()));
    }
    
    let token = &auth_header[7..];
    app_auth::verify_jwt(token).map_err(|_| (StatusCode::UNAUTHORIZED, "Invalid token".to_string()))
}
