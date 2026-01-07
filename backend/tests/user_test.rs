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
async fn test_user_management() {
    let (db, cache) = common::setup().await;
    let app = api::router(db.clone(), cache.clone());

    // 1. Setup Admin User
    let admin_username = "test_user_mgr_admin";
    let admin_pass = "admin123";
    let hash = web_app::auth::hash_password(admin_pass).unwrap();
    
    if let Some(u) = db.get_user_by_username(admin_username).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }
    let admin_id = db.create_user_full(admin_username, &hash, "admin", "EQ_ADMIN_MGR", None).await.unwrap();
    let admin_token = web_app::auth::create_jwt(admin_id, admin_username, "admin").unwrap();

    // 2. Create Target User via API
    let target_username = "test_target_user";
    // Ensure cleanup
    if let Some(u) = db.get_user_by_username(target_username).await.unwrap() {
        db.delete_user(u.id).await.unwrap();
    }

    let create_payload = serde_json::json!({
        "username": target_username,
        "password": "password",
        "role": "farmer",
        "address": "EQ_TARGET_ADDR",
        "name": "Target Farmer"
    });

    let req_create = Request::builder()
        .uri("/admin/users")
        .method("POST")
        .header("content-type", "application/json")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::from(serde_json::to_string(&create_payload).unwrap()))
        .unwrap();

    let res_create = app.clone().oneshot(req_create).await.unwrap();
    assert_eq!(res_create.status(), StatusCode::OK);
    
    let body_create = res_create.into_body().collect().await.unwrap().to_bytes();
    let json_create: Value = serde_json::from_slice(&body_create).unwrap();
    let target_id = json_create["id"].as_str().unwrap();

    // 3. List Users and verify existence
    let req_list = Request::builder()
        .uri("/admin/users")
        .method("GET")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::empty())
        .unwrap();

    let res_list = app.clone().oneshot(req_list).await.unwrap();
    assert_eq!(res_list.status(), StatusCode::OK);
    
    let body_list = res_list.into_body().collect().await.unwrap().to_bytes();
    let users: Vec<Value> = serde_json::from_slice(&body_list).unwrap();
    assert!(users.iter().any(|u| u["username"] == target_username));

    // 4. Disable User
    let req_disable = Request::builder()
        .uri(&format!("/admin/users/{}/disable", target_id))
        .method("PUT")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::empty())
        .unwrap();

    let res_disable = app.clone().oneshot(req_disable).await.unwrap();
    assert_eq!(res_disable.status(), StatusCode::OK);

    // Verify in DB
    let target_user = db.get_user_by_username(target_username).await.unwrap().unwrap();
    assert_eq!(target_user.is_disabled, Some(true));

    // 5. Delete User
    let req_delete = Request::builder()
        .uri(&format!("/admin/users/{}", target_id))
        .method("DELETE")
        .header("Authorization", format!("Bearer {}", admin_token))
        .body(Body::empty())
        .unwrap();

    let res_delete = app.oneshot(req_delete).await.unwrap();
    assert_eq!(res_delete.status(), StatusCode::OK);

    // Verify gone
    let target_user_gone = db.get_user_by_username(target_username).await.unwrap();
    assert!(target_user_gone.is_none());
}
