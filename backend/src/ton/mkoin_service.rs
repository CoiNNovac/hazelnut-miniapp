use crate::ton::client::Client;
use crate::ton::wallet::Wallet;
use anyhow::Result;
use std::sync::Arc;
use tonlib_core::cell::{CellBuilder, BagOfCells};
use tracing::{error, info};

// MKOIN contract address on testnet
const MKOIN_ADDRESS: &str = "EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD";

// Tact message opcodes (calculated from message name CRC32)
// For "Mint" message: opcode = crc32("Mint") & 0x7fffffff
// Calculated: 0x642B7D07
const MINT_OPCODE: u32 = 0x642B7D07;

pub struct MkoinService {
    client: Client,
    admin_wallet: Wallet,
}

impl MkoinService {
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

        if !recipient.starts_with("EQ") && !recipient.starts_with("UQ") {
            return Err(anyhow::anyhow!("Invalid TON address format"));
        }

        // Build Mint message body
        // Message structure (Tact):
        // [32 bits] opcode
        // [coins] amount (VarUInteger 16)
        // [MsgAddress] receiver
        let mut body_builder = CellBuilder::new();

        // Store opcode
        body_builder.store_u32(32, MINT_OPCODE)?;

        // Store amount as coins (VarUInteger 16)
        // For now, we'll use a simplified coins encoding
        // TODO: Implement proper VarUInteger 16 encoding
        let amount_bytes = amount.to_be_bytes();
        body_builder.store_slice(&amount_bytes)?;

        // Store receiver address
        // TODO: Implement proper MsgAddress encoding
        // For now, store the address string
        body_builder.store_slice(recipient.as_bytes())?;

        let body = body_builder.build()?;

        info!("Mint message body created");

        // Build destination address cell
        // TODO: Properly parse and encode the TON address
        let mut dest_builder = CellBuilder::new();
        dest_builder.store_slice(MKOIN_ADDRESS.as_bytes())?;
        let dest_cell = Arc::new(dest_builder.build()?);

        // Create transaction using admin wallet
        // Value: 0.05 TON (50,000,000 nanoTON) minimum for gas
        let message = self.admin_wallet.create_external_message(
            dest_cell,
            50_000_000, // 0.05 TON
            Arc::new(body),
        )?;

        // Serialize to BoC
        let boc = BagOfCells::from_root((*message).clone());
        let serialized = boc.serialize(true)?;
        let boc_base64 = base64::encode(&serialized);

        info!("Sending mint transaction...");

        // Send transaction
        let result = self.client.send_boc(&boc_base64).await?;

        // Extract transaction hash from response
        let tx_hash = result
            .get("hash")
            .and_then(|h| h.as_str())
            .unwrap_or("unknown")
            .to_string();

        info!("Mint transaction sent! TX hash: {}", tx_hash);

        Ok(tx_hash)
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

                        info!("Balance: {} nanocoins ({} MKOIN)", balance, balance as f64 / 1_000_000_000.0);
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
        // TODO: Properly encode address as cell parameter
        let addr_json = serde_json::json!({
            "type": "tvm.Slice",
            "bytes": base64::encode(owner)
        });

        // Call get_wallet_address(owner) on MKOIN master
        let result = self
            .client
            .run_get_method(
                MKOIN_ADDRESS,
                "get_wallet_address",
                vec![addr_json],
            )
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
        info!("Fetching MKOIN total supply");

        let result = self
            .client
            .run_get_method(MKOIN_ADDRESS, "get_jetton_data", vec![])
            .await?;

        // Parse result: [total_supply, mintable, admin_address, content, jetton_wallet_code]
        if let Some(stack) = result.get("stack").and_then(|s| s.as_array()) {
            if let Some(supply_item) = stack.first() {
                // Parse total_supply from stack item
                if let Some(val_arr) = supply_item.as_array() {
                    if val_arr.len() == 2 && val_arr[0] == "num" {
                        let hex_val = val_arr[1].as_str().unwrap_or("0x0");
                        let clean_hex = hex_val.trim_start_matches("0x");
                        let total_supply = u128::from_str_radix(clean_hex, 16).unwrap_or(0);

                        info!("Total supply: {} nanocoins ({} MKOIN)", total_supply, total_supply as f64 / 1_000_000_000.0);
                        return Ok(total_supply);
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
