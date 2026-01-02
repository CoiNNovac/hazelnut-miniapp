use crate::db::Database;
use crate::ton::client::Client;
use anyhow::Result;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{error, info}; // Removed warn

pub struct Indexer {
    db: Database,
    client: Client,
    current_seqno: Option<u64>,
}

impl Indexer {
    pub async fn new(db: Database) -> Result<Self> {
        let client = Client::new("https://toncenter.com/api/v2", None);
        Ok(Self {
            db,
            client,
            current_seqno: None,
        })
    }

    pub async fn run(mut self) -> Result<()> {
        info!("Starting TON Indexer Loop...");

        loop {
            if let Err(e) = self.sync_step().await {
                error!("Sync step failed: {}", e);
                sleep(Duration::from_secs(5)).await;
            }
            sleep(Duration::from_secs(2)).await;
        }
    }

    async fn sync_step(&mut self) -> Result<()> {
        let info = self.client.get_masterchain_info().await?;
        let last_seqno = info["last"]["seqno"]
            .as_u64()
            .ok_or(anyhow::anyhow!("No seqno"))?;

        let start = self.current_seqno.unwrap_or(last_seqno);

        if start > last_seqno {
            return Ok(());
        }

        info!("Processing block seqno: {}", start);

        // 2. Get Shards info for this Masterchain block
        // The masterchain block contains the latest state of all shards
        let shards_resp = self.client.get_shards(start).await?;
        let shards = shards_resp["shards"]
            .as_array()
            .map(|v| v.clone())
            .unwrap_or_default();

        info!(
            "Processing MC block {}, found {} shards",
            start,
            shards.len()
        );

        // 3. Process Shards (Basechain)
        for shard in shards {
            let workchain = shard["workchain"].as_i64().unwrap_or(0);
            let shard_id = shard["shard"].as_i64().unwrap_or(-9223372036854775808);
            let shard_seqno = shard["seqno"].as_u64().unwrap_or(0);

            // Fetch txs for this specific shard block
            let txs_val = self
                .client
                .get_block_transactions(workchain as i32, shard_id, shard_seqno)
                .await?;

            if let Some(txs) = txs_val.as_array() {
                if !txs.is_empty() {
                    info!("  Shard {}: {} txs", shard_id, txs.len());
                }
                for tx in txs {
                    self.process_transaction(tx).await?;
                }
            }
        }

        self.current_seqno = Some(start + 1);
        Ok(())
    }

    async fn process_transaction(&self, tx: &serde_json::Value) -> Result<()> {
        // Look for incoming messages or out messages with body
        let _tx_hash = tx["transaction_id"]["hash"].as_str().unwrap_or("?");

        // Simple log for now to prove we see data
        // In real impl, we parse the "in_msg" body for OP_CODE 0x7362d096
        if let Some(in_msg) = tx.get("in_msg") {
            if let Some(source) = in_msg.get("source") {
                info!("    Tx {} from {}", _tx_hash, source);
            }
        }
        Ok(())
    }
}
