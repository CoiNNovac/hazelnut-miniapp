use anyhow::Result;
use reqwest::Client as HttpClient;
use serde_json::json;

#[derive(Clone)]
pub struct Client {
    http: HttpClient,
    base_url: String,
    api_key: Option<String>,
}

impl Client {
    pub fn new(base_url: &str, api_key: Option<String>) -> Self {
        Self {
            http: HttpClient::new(),
            base_url: base_url.to_string(),
            api_key,
        }
    }

    pub async fn get_masterchain_info(&self) -> Result<serde_json::Value> {
        self.post("getMasterchainInfo", json!({})).await
    }

    pub async fn get_block_transactions(
        &self,
        workchain: i32,
        shard: i64,
        seqno: u64,
    ) -> Result<serde_json::Value> {
        self.post(
            "getBlockTransactions",
            json!({
                "workchain": workchain,
                "shard": shard,
                "seqno": seqno,
            }),
        )
        .await
    }

    pub async fn get_shards(&self, seqno: u64) -> Result<serde_json::Value> {
        self.post(
            "shards",
            json!({
                "seqno": seqno,
            }),
        )
        .await
    }

    pub async fn send_boc(&self, boc_base64: &str) -> Result<serde_json::Value> {
        self.post(
            "sendBoc",
            json!({
                "boc": boc_base64
            }),
        )
        .await
    }

    pub async fn run_get_method(&self, address: &str, method: &str, stack: Vec<serde_json::Value>) -> Result<serde_json::Value> {
        self.post(
            "runGetMethod",
            json!({
                "address": address,
                "method": method,
                "stack": stack
            }),
        )
        .await
    }

    // Helper to get wallet seqno
    pub async fn get_wallet_seqno(&self, address: &str) -> Result<u64> {
        let result = self.run_get_method(address, "seqno", vec![]).await?;
        
        // Parse result stack
        // Result format: {"stack": [["num", "0x123"]], "exit_code": 0}
        if let Some(exit_code) = result.get("exit_code") {
             if exit_code.as_i64().unwrap_or(-1) != 0 {
                 // If account is uninitialized, seqno is usually 0 or method fails
                 // We'll assume 0 for uninit
                 return Ok(0);
             }
        }

        if let Some(stack) = result["stack"].as_array() {
            if let Some(item) = stack.first() {
                // Item is ["num", "hex_value"]
                if let Some(val_arr) = item.as_array() {
                    if val_arr.len() == 2 && val_arr[0] == "num" {
                        let hex_val = val_arr[1].as_str().unwrap_or("0x0");
                        let clean_hex = hex_val.trim_start_matches("0x");
                        return Ok(u64::from_str_radix(clean_hex, 16).unwrap_or(0));
                    }
                }
            }
        }
        Ok(0)
    }

    async fn post(&self, method: &str, params: serde_json::Value) -> Result<serde_json::Value> {
        let url = format!("{}/{}", self.base_url, method);
        let mut builder = self.http.post(&url).json(&params);

        if let Some(key) = &self.api_key {
            builder = builder.header("X-API-Key", key);
        }

        let resp = builder.send().await?;
        let text = resp.text().await?;
        let body: serde_json::Value = match serde_json::from_str(&text) {
            Ok(json) => json,
            Err(e) => {
                anyhow::bail!(
                    "Failed to parse JSON from {}: {} - Raw body: {}",
                    url,
                    e,
                    text
                )
            }
        };

        if let Some(error) = body.get("error") {
            return Err(anyhow::anyhow!("RPC Error: {:?}", error));
        }

        Ok(body["result"].clone())
    }
}
