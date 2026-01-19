use crate::ton::client::Client;
use crate::ton::wallet::Wallet;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tonlib_core::cell::{CellBuilder, BagOfCells};
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTokenResult {
    pub tx_hash: String,
    pub jetton_address: String,
}

// Factory contract address on testnet
const FACTORY_ADDRESS: &str = "EQBY-OWwam2n7DO25xV7juUWS9MV9xjJ1bwL1dISkYDNcGP2";

// Tact message opcodes (calculated from message name CRC32)
// For "CreateJetton" message: opcode = crc32("CreateJetton") & 0x7fffffff
// Calculated: 0x1B8B6387
const CREATE_JETTON_OPCODE: u32 = 0x1B8B6387;

pub struct FactoryService {
    client: Client,
    admin_wallet: Wallet,
}

impl FactoryService {
    pub fn new() -> Self {
        let mnemonic = std::env::var("ADMIN_MNEMONIC")
            .unwrap_or_else(|_| {
                error!("ADMIN_MNEMONIC not set in environment");
                "".to_string()
            });

        let admin_wallet = if !mnemonic.is_empty() {
            Wallet::from_seed(&mnemonic).unwrap_or_else(|e| {
                error!("Failed to load admin wallet from mnemonic: {}", e);
                Wallet::new_random()
            })
        } else {
            Wallet::new_random()
        };

        Self {
            client: Client::new("https://testnet.toncenter.com/api/v2", None),
            admin_wallet,
        }
    }

    /// Create a new campaign jetton via Factory contract
    ///
    /// # Arguments
    /// * `farmer_wallet` - Farmer's wallet address
    /// * `name` - Token name
    /// * `symbol` - Token symbol
    /// * `initial_supply` - Initial supply in nanocoins
    ///
    /// # Returns
    /// CreateTokenResult with tx_hash and jetton_address
    pub async fn create_campaign_token(
        &self,
        farmer_wallet: &str,
        name: &str,
        symbol: &str,
        initial_supply: u128,
    ) -> Result<CreateTokenResult> {
        info!(
            "Creating campaign token: {} ({}) with supply {} for farmer {}",
            name, symbol, initial_supply, farmer_wallet
        );

        // Validate inputs
        if initial_supply == 0 {
            return Err(anyhow::anyhow!("Initial supply must be greater than 0"));
        }

        // Address format validation is handled by store_ton_address()
        // Accepts all formats: Raw (0:..., -1:...), EQ, UQ, kQ, 0Q

        // Build CreateJetton message body
        // Message structure (Tact):
        // [32 bits] opcode
        // [MsgAddress] farmer_wallet
        // [Cell] content (metadata)
        // [coins] initial_supply (VarUInteger 16)
        let mut body_builder = CellBuilder::new();

        // Store opcode
        body_builder.store_u32(32, CREATE_JETTON_OPCODE)?;

        // Store farmer_wallet address
        // TODO: Properly encode TON address as MsgAddress
        body_builder.store_slice(farmer_wallet.as_bytes())?;

        // Build content cell (Jetton metadata)
        let content_cell = self.build_jetton_metadata(name, symbol)?;
        body_builder.store_reference(&content_cell)?;

        // Store initial_supply as coins (VarUInteger 16)
        // TODO: Implement proper VarUInteger 16 encoding
        let supply_bytes = initial_supply.to_be_bytes();
        body_builder.store_slice(&supply_bytes)?;

        let body = body_builder.build()?;

        info!("CreateJetton message body created");

        // Create transaction using admin wallet
        // Value: 1.0 TON minimum (0.3 for deploy + 0.2 for mint + buffer)
        // Address encoding is now handled inside create_external_message
        let message = self.admin_wallet.create_external_message(
            FACTORY_ADDRESS, // Address string (raw or user-friendly format)
            1_000_000_000,   // 1.0 TON
            Arc::new(body),
        )?;

        // Serialize to BoC
        let boc = BagOfCells::from_root((*message).clone());
        let serialized = boc.serialize(true)?;
        let boc_base64 = base64::encode(&serialized);

        info!("Sending CreateJetton transaction...");

        // Send transaction
        let result = self.client.send_boc(&boc_base64).await?;

        // Extract transaction hash from response
        let tx_hash = result
            .get("hash")
            .and_then(|h| h.as_str())
            .unwrap_or("unknown")
            .to_string();

        info!("CreateJetton transaction sent! TX hash: {}", tx_hash);

        // Compute the deterministic jetton address
        // The Factory creates jettons with: initOf JettonMaster(myAddress(), content)
        // So owner is FACTORY_ADDRESS and content is the metadata cell we built
        let jetton_address = self
            .get_jetton_address(FACTORY_ADDRESS, content_cell)
            .await
            .unwrap_or_else(|e| {
                error!("Failed to compute jetton address: {}", e);
                format!("COMPUTE_FAILED_{}", tx_hash)
            });

        info!("Computed jetton address: {}", jetton_address);

        Ok(CreateTokenResult {
            tx_hash,
            jetton_address,
        })
    }

    /// Build Jetton metadata cell
    ///
    /// Creates a cell containing token metadata (name, symbol, etc.)
    fn build_jetton_metadata(&self, name: &str, symbol: &str) -> Result<Arc<tonlib_core::cell::Cell>> {
        // TODO: Implement proper TEP-64 metadata format
        // For now, create a simple cell with name and symbol
        let mut metadata_builder = CellBuilder::new();

        // Store metadata as simple strings for now
        metadata_builder.store_slice(name.as_bytes())?;
        metadata_builder.store_slice(symbol.as_bytes())?;

        Ok(Arc::new(metadata_builder.build()?))
    }

    /// Get farmer wallet for a jetton address
    ///
    /// Calls get_farmer_wallet(jetton_address) on Factory contract
    pub async fn get_farmer_wallet(&self, jetton_address: &str) -> Result<Option<String>> {
        info!("Fetching farmer wallet for jetton {}", jetton_address);

        // Build address parameter
        let addr_json = serde_json::json!({
            "type": "tvm.Slice",
            "bytes": base64::encode(jetton_address)
        });

        // Call get_farmer_wallet(jetton_address) on Factory
        let result = self
            .client
            .run_get_method(
                FACTORY_ADDRESS,
                "get_farmer_wallet",
                vec![addr_json],
            )
            .await?;

        // Parse returned address from stack
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(addr_item) = stack.first() {
                if let Some(val_arr) = addr_item.as_array() {
                    if val_arr.len() == 2 {
                        let addr_bytes = val_arr[1].as_str().unwrap_or("");
                        if !addr_bytes.is_empty() {
                            return Ok(Some(addr_bytes.to_string()));
                        }
                    }
                }
            }
        }

        Ok(None)
    }

    /// Get jetton address for owner and content
    ///
    /// Calls get_jetton_address(owner, content) on Factory contract
    /// This returns the deterministic address for a jetton with given params
    pub async fn get_jetton_address(
        &self,
        owner: &str,
        content_cell: Arc<tonlib_core::cell::Cell>,
    ) -> Result<String> {
        info!("Computing jetton address for owner {}", owner);

        // Build parameters for get_jetton_address(owner, content)
        // TODO: Properly encode address and cell as TVM parameters
        let owner_json = serde_json::json!({
            "type": "tvm.Slice",
            "bytes": base64::encode(owner)
        });

        // For content cell, we need to serialize it to bytes
        let content_boc = BagOfCells::from_root((*content_cell).clone());
        let content_bytes = content_boc.serialize(true)?;
        let content_json = serde_json::json!({
            "type": "tvm.Cell",
            "bytes": base64::encode(&content_bytes)
        });

        // Call get_jetton_address on Factory
        let result = self
            .client
            .run_get_method(
                FACTORY_ADDRESS,
                "get_jetton_address",
                vec![owner_json, content_json],
            )
            .await?;

        // Parse returned address from stack
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(addr_item) = stack.first() {
                if let Some(val_arr) = addr_item.as_array() {
                    if val_arr.len() == 2 {
                        let addr_bytes = val_arr[1].as_str().unwrap_or("");
                        if !addr_bytes.is_empty() {
                            // TODO: Properly decode address from cell bytes to readable format
                            return Ok(addr_bytes.to_string());
                        }
                    }
                }
            }
        }

        Err(anyhow::anyhow!("Failed to get jetton address"))
    }

    /// Get total number of jettons created
    pub async fn get_jetton_count(&self) -> Result<u32> {
        info!("Fetching jetton count from Factory");

        let result = self
            .client
            .run_get_method(FACTORY_ADDRESS, "get_jetton_count", vec![])
            .await?;

        // Parse result from stack
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(count_item) = stack.first() {
                if let Some(val_arr) = count_item.as_array() {
                    if val_arr.len() == 2 && val_arr[0] == "num" {
                        let hex_val = val_arr[1].as_str().unwrap_or("0x0");
                        let clean_hex = hex_val.trim_start_matches("0x");
                        let count = u32::from_str_radix(clean_hex, 16).unwrap_or(0);
                        return Ok(count);
                    }
                }
            }
        }

        Ok(0)
    }

    /// Get admin wallet address (for verification)
    pub fn get_admin_address(&self) -> String {
        self.admin_wallet.address.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_jetton_count() {
        // This test requires testnet access
        if std::env::var("ADMIN_MNEMONIC").is_err() {
            return;
        }

        let service = FactoryService::new();
        let result = service.get_jetton_count().await;
        println!("Jetton count: {:?}", result);
    }
}
