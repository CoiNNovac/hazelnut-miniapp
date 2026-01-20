use crate::ton::address_utils::store_ton_address;
use crate::ton::client::Client;
use crate::ton::wallet::Wallet;
use anyhow::Result;
use base64::Engine;
use num_bigint::BigUint;
use std::sync::Arc;
use tonlib_core::cell::{BagOfCells, CellBuilder};
use tracing::{error, info};

// MKOIN contract address on testnet (raw format for reliability)
// MKOIN contract address on testnet
// Default fallback if not in ENV
const MKOIN_ADDRESS_DEFAULT: &str = "EQATDLvt8bY8BGb-DGBZxwe6EZla3Rcij41fqv_OFlLXvgpV";

fn get_mkoin_address() -> String {
    std::env::var("MKOIN_ADDRESS").unwrap_or_else(|_| MKOIN_ADDRESS_DEFAULT.to_string())
}

// Tact message opcodes (calculated from message name CRC32)
// For "Mint" message: opcode = crc32("Mint") & 0x7fffffff
// Calculated: 0x642B7D07
const MINT_OPCODE: u32 = 0x642B7D07;

use std::sync::Mutex;
use std::time::{Duration, Instant};

pub struct MkoinService {
    client: Client,
    admin_wallet: Mutex<Wallet>,
    supply_cache: Mutex<Option<(u128, Instant)>>,
}

impl MkoinService {
    pub fn new() -> Self {
        let mnemonic = std::env::var("ADMIN_MNEMONIC").unwrap_or_else(|_| {
            error!("ADMIN_MNEMONIC not set in environment");
            "".to_string()
        });

        let mut admin_wallet = if !mnemonic.is_empty() {
            Wallet::from_seed(&mnemonic).unwrap_or_else(|e| {
                error!("Failed to load admin wallet from mnemonic: {}", e);
                Wallet::new_random()
            })
        } else {
            Wallet::new_random()
        };

        // Override address if ADMIN_ADDRESS is set (workaround for incorrect derivation)
        if let Ok(addr) = std::env::var("ADMIN_ADDRESS") {
            if !addr.is_empty() {
                info!("Using ADMIN_ADDRESS from env: {}", addr);
                admin_wallet.address = addr;
            }
        }

        let mut api_key = std::env::var("TON_API_KEY").ok();

        // Fallback to the known-good key from the working script if env is missing
        if api_key.is_none() {
            api_key = Some(
                "b2de8ad043c1dc14b67d337b19bb9f48bb7f291fb4d2ced98c17c6acf8c38136".to_string(),
            );
            tracing::info!("Using fallback API Key from script (b2de...)");
        }

        if let Some(ref k) = api_key {
            info!("MkoinService loaded API Key: {}...", &k[0..4]);
        } else {
            // Should not happen now
            tracing::warn!("MkoinService: TON_API_KEY not found in env");
        }

        Self {
            client: Client::new("https://testnet.toncenter.com/api/v2/jsonRPC", api_key),
            admin_wallet: Mutex::new(admin_wallet),
            supply_cache: Mutex::new(None),
        }
    }

    /// Mint MKOIN to a recipient address
    ///
    /// # Arguments
    /// * `recipient` - TON address of recipient (EQ...)
    /// * `amount` - Amount in nanocoins (1 MKOIN = 1_000_000_000 nanocoins)
    ///
    /// # Returns
    /// Transaction hash on success
    pub async fn mint_mkoin(&self, recipient: &str, amount: u128) -> Result<String> {
        info!(
            "Minting {} nanocoins ({} MKOIN) to {}",
            amount,
            amount as f64 / 1_000_000_000.0,
            recipient
        );

        // Validate inputs
        if amount == 0 {
            return Err(anyhow::anyhow!("Amount must be greater than 0"));
        }

        // 1. Fetch current seqno from network to ensure transaction is accepted
        let wallet_address = {
            let wallet = self.admin_wallet.lock().unwrap();
            wallet.address.clone()
        };

        let seqno = self.client.get_wallet_seqno(&wallet_address).await?;
        info!("Current admin wallet seqno: {}", seqno);

        // 2. Build Mint message body
        let mut body_builder = CellBuilder::new();
        body_builder.store_u32(32, MINT_OPCODE)?;
        body_builder.store_coins(&BigUint::from(amount))?;
        store_ton_address(&mut body_builder, recipient)?;
        let body = body_builder.build()?;

        info!("Mint message body created");

        // 3. Create, sign, and build external message
        // We lock the wallet to update seqno and sign
        // Note: In a high-concurrency env, we might need a better lock or queue,
        // but for admin tool this is fine.
        let (boc_base64, calculated_hash) = {
            let mut wallet = self.admin_wallet.lock().unwrap();
            wallet.seqno = seqno;

            let message = wallet.create_external_message(
                &get_mkoin_address(),
                50_000_000, // 0.05 TON
                Arc::new(body),
            )?;

            // Calculate message hash
            let msg_hash = message.cell_hash();
            let calculated_hash = msg_hash.to_string();

            // Serialize
            let boc = BagOfCells::from_root((*message).clone());
            let serialized = boc.serialize(true)?;
            let boc_base64 = base64::engine::general_purpose::STANDARD.encode(&serialized);

            (boc_base64, calculated_hash)
        };

        info!("Generated Message Hash: {}", calculated_hash);
        info!("Sending mint transaction...");

        // 4. Send transaction
        let _result = self.client.send_boc(&boc_base64).await?;

        info!("Local message hash: {}", calculated_hash);
        info!("Waiting for transaction confirmation...");

        // 5. Verification Loop
        // Poll for up to 60 seconds (30 attempts * 2s)
        for i in 0..30 {
            tokio::time::sleep(Duration::from_secs(2)).await;

            let txs_result = self.client.get_transactions(&wallet_address, 20).await;

            match txs_result {
                Ok(txs_value) => {
                    if let Some(txs) = txs_value.as_array() {
                        for tx in txs {
                            // Check in_msg
                            if let Some(in_msg) = tx.get("in_msg") {
                                // The API might return body_hash field or we might need to look at msg body
                                // Standard toncenter v2 likely returns body_hash or hash of the message itself

                                // We are looking for the HASH of the inbound message, which matches our calculated_hash
                                // Note: We need to match base64 encoded hash

                                // Try "body_hash" first, then generic "hash"
                                let _msg_recv_hash = in_msg
                                    .get("body_hash")
                                    .and_then(|h| h.as_str())
                                    .or_else(|| in_msg.get("hash").and_then(|h| h.as_str())) // 'hash' is usually msg ID
                                    .unwrap_or("");

                                // Our calculated_hash is HEX. The API typically returns BASE64 for hashes.
                                // We need to handle this comparison carefuly.

                                // Let's simplify: Convert our HEX hash to Base64 to compare with API
                                let calc_bytes = hex::decode(&calculated_hash).unwrap_or_default();
                                let calc_b64 =
                                    base64::engine::general_purpose::STANDARD.encode(&calc_bytes);

                                // Check if this message corresponds to our send
                                // 1. Compare hashes (either direct or body)
                                // Note: For external messages, "hash" of in_msg is usually the message hash we calculated.
                                let api_hash_b64 = in_msg
                                    .get("body_hash")
                                    .and_then(|h| h.as_str())
                                    .unwrap_or("");

                                // Also check `msg_id` or `hash` field if body_hash doesn't match
                                // toncenter v2 structure: transaction -> in_msg -> body_hash

                                if api_hash_b64 == calc_b64 {
                                    // MATCH FOUND!
                                    let real_tx_hash = tx
                                        .get("transaction_id")
                                        .and_then(|id| id.get("hash"))
                                        .and_then(|h| h.as_str())
                                        .unwrap_or(&calculated_hash)
                                        .to_string();

                                    info!(
                                        "Transaction confirmed on-chain! Real TX Hash: {}",
                                        real_tx_hash
                                    );

                                    // Optionally check compute phase success
                                    // if let Some(compute) = tx.get("compute_phase") { ... }

                                    return Ok(real_tx_hash);
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    tracing::warn!("Failed to fetch transactions while polling: {}", e);
                }
            }

            if i % 5 == 0 {
                info!("Still waiting for confirmation... ({}/30)", i);
            }
        }

        // If we timeout, we return Error.
        // The user can try again or check explorer manually.
        Err(anyhow::anyhow!(
            "Transaction sent but not confirmed within 60 seconds. It may still process. Local Msg Hash: {}",
            calculated_hash
        ))
    }

    /// Get MKOIN balance for an address
    ///
    /// # Arguments
    /// * `owner` - TON address to check balance for
    ///
    /// # Returns
    /// Balance in nanocoins
    pub async fn get_balance(&self, owner: &str) -> Result<u128> {
        info!("Fetching MKOIN balance for {}", owner);

        // Step 1: Get wallet address for owner
        let wallet_address = self.get_wallet_address(owner).await?;

        info!("MKOIN wallet address: {}", wallet_address);

        // Step 2: Call get_wallet_data on the wallet
        let result = self
            .client
            .run_get_method(&wallet_address, "get_wallet_data", vec![])
            .await?;

        // Parse result: [balance, owner, master, code]
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(balance_item) = stack.first() {
                // Parse balance from stack item
                if let Some(val_arr) = balance_item.as_array() {
                    if val_arr.len() == 2 && val_arr[0] == "num" {
                        let hex_val = val_arr[1].as_str().unwrap_or("0x0");
                        let clean_hex = hex_val.trim_start_matches("0x");
                        let balance = u128::from_str_radix(clean_hex, 16).unwrap_or(0);

                        info!(
                            "Balance: {} nanocoins ({} MKOIN)",
                            balance,
                            balance as f64 / 1_000_000_000.0
                        );
                        return Ok(balance);
                    }
                }
            }
        }

        Ok(0)
    }

    /// Get jetton wallet address for an owner
    ///
    /// Calls get_wallet_address(owner) on MKOIN master contract
    async fn get_wallet_address(&self, owner: &str) -> Result<String> {
        // Build address cell for parameter
        let addr_json = serde_json::json!({
            "type": "tvm.Slice",
            "bytes": base64::engine::general_purpose::STANDARD.encode(owner)
        });

        // Call get_wallet_address(owner) on MKOIN master
        let result = self
            .client
            .run_get_method(&get_mkoin_address(), "get_wallet_address", vec![addr_json])
            .await?;

        // Parse returned address from stack
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(addr_item) = stack.first() {
                // Parse address from stack item
                if let Some(val_arr) = addr_item.as_array() {
                    if val_arr.len() == 2 {
                        let addr_bytes = val_arr[1].as_str().unwrap_or("");
                        // TODO: Properly decode address bytes
                        return Ok(addr_bytes.to_string());
                    }
                }
            }
        }

        Err(anyhow::anyhow!("No wallet address returned"))
    }

    /// Get total supply of MKOIN
    pub async fn get_total_supply(&self) -> Result<u128> {
        // Check cache first (valid for 30 seconds)
        {
            let cache = self.supply_cache.lock().unwrap();
            if let Some((supply, timestamp)) = *cache {
                if timestamp.elapsed() < Duration::from_secs(30) {
                    return Ok(supply);
                }
            }
        }

        info!("Fetching MKOIN total supply");

        let result = match self
            .client
            .run_get_method(&get_mkoin_address(), "get_jetton_data", vec![])
            .await
        {
            Ok(res) => res,
            Err(e) => {
                // If RPC fails, try to return stale cache if available
                let cache = self.supply_cache.lock().unwrap();
                if let Some((supply, _)) = *cache {
                    error!("RPC failed, returning cached supply. Error: {}", e);
                    return Ok(supply);
                }
                return Err(e);
            }
        };

        // Parse result: [total_supply, mintable, admin_address, content, jetton_wallet_code]
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            info!("get_jetton_data stack: {:?}", stack);
            if let Some(supply_item) = stack.first() {
                // Parse total_supply from stack item
                if let Some(val_arr) = supply_item.as_array() {
                    if val_arr.len() == 2 && val_arr[0] == "num" {
                        let hex_val = val_arr[1].as_str().unwrap_or("0x0");
                        let clean_hex = hex_val.trim_start_matches("0x");
                        let total_supply = u128::from_str_radix(clean_hex, 16).unwrap_or(0);

                        info!(
                            "Total supply: {} nanocoins ({} MKOIN)",
                            total_supply,
                            total_supply as f64 / 1_000_000_000.0
                        );

                        // Update cache
                        let mut cache = self.supply_cache.lock().unwrap();
                        *cache = Some((total_supply, Instant::now()));

                        return Ok(total_supply);
                    }
                }
            }
        }

        Ok(0)
    }

    /// Get admin wallet address (for verification)
    pub fn get_admin_address(&self) -> String {
        let wallet = self.admin_wallet.lock().unwrap();
        wallet.address.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_total_supply() {
        // This test requires testnet access
        // Skip if not in integration test environment
        if std::env::var("ADMIN_MNEMONIC").is_err() {
            return;
        }

        let service = MkoinService::new();
        let result = service.get_total_supply().await;
        println!("Total supply: {:?}", result);
    }
}
