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
