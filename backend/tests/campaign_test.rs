use web_app::api;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;
use http_body_util::BodyExt;
use serde_json::Value;

mod common;

#[tokio::test]
async fn test_create_and_list_campaigns() {
    let (db, cache) = common::setup().await;
    let app = api::router(db.clone(), cache.clone());

    // 1. Create Admin User (to approve campaigns or create them)
    // Actually campaign creation can be done by farmer.
    let username = "test_farmer_campaign";
    let password = "password";
    let hash = web_app::auth::hash_password(password).unwrap();
    
    if let Some(u) = db.get_user_by_username(username).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }
    
    let user_id = db.create_user_full(username, &hash, "farmer", "EQ_FARMER_ADDR", None).await.unwrap();
    
    // Generate Token
    let token = web_app::auth::create_jwt(user_id, username, "farmer").unwrap();

    // 2. Create Campaign
    let campaign_data = serde_json::json!({
        "name": "Test Farm Token",
        "token_name": "FarmCoin",
        "token_symbol": "FARM",
        "token_supply": "1000000",
        "suggested_price": "0.1",
        "start_time": "2025-01-01T00:00:00Z",
        "end_time": "2025-12-31T23:59:59Z",
        "description": "A test token"
    });

    let req = Request::builder()
        .uri("/campaigns")
        .method("POST")
        .header("content-type", "application/json")
        .header("Authorization", format!("Bearer {}", token))
        .body(Body::from(serde_json::to_string(&campaign_data).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(req).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "created");
    let campaign_id = json["id"].as_str().unwrap();

    // 3. List Campaigns (Farmer should see it)
    let req_list = Request::builder()
        .uri("/campaigns")
        .method("GET")
        .header("Authorization", format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response_list = app.clone().oneshot(req_list).await.unwrap();
    assert_eq!(response_list.status(), StatusCode::OK);
    
    let body_list = response_list.into_body().collect().await.unwrap().to_bytes();
    let campaigns: Vec<Value> = serde_json::from_slice(&body_list).unwrap();
    
    assert!(campaigns.iter().any(|c| c["id"].as_str().unwrap() == campaign_id));
    assert!(campaigns.iter().any(|c| c["name"] == "Test Farm Token"));

    // 4. Update Status (Requires Admin)
    let admin_username = "test_admin_campaign";
    if let Some(u) = db.get_user_by_username(admin_username).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }
    let admin_id = db.create_user_full(admin_username, &hash, "admin", "EQ_ADMIN_ADDR", None).await.unwrap();
    let admin_token = web_app::auth::create_jwt(admin_id, admin_username, "admin").unwrap();

    let status_update = serde_json::json!({ "status": "approved" });
    let req_update = Request::builder()
        .uri(&format!("/campaigns/{}/status", campaign_id))
        .method("PUT")
        .header("content-type", "application/json")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::from(serde_json::to_string(&status_update).unwrap()))
        .unwrap();

    let response_update = app.clone().oneshot(req_update).await.unwrap();
    assert_eq!(response_update.status(), StatusCode::OK);

    // Verify update
    let req_get = Request::builder()
        .uri(&format!("/campaigns/{}", campaign_id))
        .method("GET")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::empty())
        .unwrap();
        
    let response_get = app.oneshot(req_get).await.unwrap();
    let body_get = response_get.into_body().collect().await.unwrap().to_bytes();
    let campaign_json: Value = serde_json::from_slice(&body_get).unwrap();
    
    assert_eq!(campaign_json["status"], "approved");
}
