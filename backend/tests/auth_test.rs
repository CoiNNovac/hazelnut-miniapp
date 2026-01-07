use web_app::api;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt; // for oneshot
use http_body_util::BodyExt; // for collect
use serde_json::Value;

mod common;

#[tokio::test]
async fn test_auth_login() {
    let (db, cache) = common::setup().await;
    let app = api::router(db.clone(), cache.clone());

    // 1. Create a user manually (since we need one to login)
    // We can use the DB helper directly since we have access to it via the lib
    let username = "testuser_auth";
    let password = "password123";
    let hash = web_app::auth::hash_password(password).unwrap();
    
    // Clean up if exists
    if let Some(u) = db.get_user_by_username(username).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }

    let _uid = db.create_user_full(
        username, 
        &hash, 
        "farmer", 
        "EQ_TEST_ADDR_AUTH", 
        Some("Test User")
    ).await.expect("Failed to create test user");

    // 2. Test Login Success
    let login_body = serde_json::json!({
        "username": username,
        "password": password
    });

    let req = Request::builder()
        .uri("/auth/login")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&login_body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(req).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: Value = serde_json::from_slice(&body).unwrap();
    
    assert!(body_json.get("token").is_some());
    assert_eq!(body_json["user"]["username"], username);

    // 3. Test Login Failure
    let bad_login_body = serde_json::json!({
        "username": username,
        "password": "wrongpassword"
    });

    let req = Request::builder()
        .uri("/auth/login")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&bad_login_body).unwrap()))
        .unwrap();

    let response = app.oneshot(req).await.unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_wallet_login() {
    let (db, cache) = common::setup().await;
    let app = api::router(db.clone(), cache.clone());

    let address = "EQ_WALLET_TEST_ADDR";
    
    // Ensure clean state
    if let Some(u) = db.get_user_by_address(address).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }

    // Wallet login should auto-create user
    let login_body = serde_json::json!({
        "address": address
    });

    let req = Request::builder()
        .uri("/auth/wallet")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&login_body).unwrap()))
        .unwrap();

    let response = app.oneshot(req).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: Value = serde_json::from_slice(&body).unwrap();
    
    assert!(body_json.get("token").is_some());
    assert_eq!(body_json["user"]["address"], address);
    assert_eq!(body_json["user"]["role"], "farmer"); // Default role

    // Verify in DB
    let user_db = db.get_user_by_address(address).await.unwrap();
    assert!(user_db.is_some());
}
