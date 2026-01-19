use crate::db::Campaign;
use crate::ton::client::Client;
use crate::ton::wallet::Wallet;
use anyhow::Result;
use std::str::FromStr;
use tracing::{error, info};

pub struct MintingService {
    client: Client,
    server_wallet: Wallet,
}

impl MintingService {
    pub fn new() -> Self {
        let mnemonic = std::env::var("ADMIN_MNEMONIC")
            .unwrap_or_else(|_| "admin_seed_placeholder".to_string());

        let client = Client::new("https://testnet.toncenter.com/api/v2", None);

        let wallet = Wallet::from_seed(&mnemonic).unwrap_or_else(|_| {
            error!("Invalid seed, using random wallet");
            Wallet::new_random()
        });

        Self {
            client,
            server_wallet: wallet,
        }
    }

    pub async fn mint_campaign_token(&self, campaign: &Campaign, db: &crate::db::Database) -> Result<String> {
        info!("Recording token mint for campaign: {}", campaign.name);

        // For now, we're not deploying new contracts - just recording in DB
        // All tokens will use the MKOIN contract address (raw format)
        const MKOIN_CONTRACT: &str = "0:00d2042b5a38fa538142608b0c87eaab75780684ca2313066dbc693c954253c9";

        // Parse token supply
        let supply_float = f64::from_str(&campaign.token_supply).unwrap_or(0.0);
        let supply_amount = (supply_float * 1_000_000_000.0) as u128; // Convert to nanocoins

        // Get farmer address from user table
        let farmer = db.get_user_by_id(campaign.farmer_id).await?
            .ok_or_else(|| anyhow::anyhow!("Farmer not found"))?;

        // Record the mint in database
        let _mint_id = db.record_campaign_mint(
            campaign.id,
            &farmer.address,
            &supply_amount.to_string(),
            None, // tx_hash will be filled when we actually deploy contracts
        ).await?;

        // Update campaign with mint information
        db.update_campaign_mint_info(
            campaign.id,
            &supply_amount.to_string(),
            None, // tx_hash
        ).await?;

        info!(
            "Recorded mint for campaign {}: {} tokens allocated to {}",
            campaign.token_symbol,
            supply_float,
            farmer.address
        );

        // Return MKOIN contract address
        // When Factory ABI is ready, this will return the newly deployed contract address
        Ok(MKOIN_CONTRACT.to_string())
    }

    // Note: The following methods will be used when Factory ABI is ready
    // For now, they're commented out to avoid compilation errors
    /*
    fn create_addr_none(&self) -> Result<Arc<Cell>> {
        let mut builder = CellBuilder::new();
        builder.store_u8(2, 0)?;
        Ok(Arc::new(builder.build()?))
    }

    fn create_metadata_cell(&self, campaign: &Campaign) -> Result<Arc<Cell>> {
        let metadata_url = format!("https://hazelnut.app/api/metadata/{}", campaign.id);

        let mut builder = CellBuilder::new();
        builder.store_u8(8, 1)?;
        builder.store_slice(metadata_url.as_bytes())?;

        Ok(Arc::new(builder.build()?))
    }

    fn create_jetton_minter_data(
        &self,
        total_supply: u128,
        _admin_address_cell: Arc<Cell>,
        content: Arc<Cell>,
        wallet_code: Arc<Cell>,
    ) -> Result<Arc<Cell>> {
        let mut builder = CellBuilder::new();
        builder.store_coins(&BigUint::from(total_supply))?;

        builder.store_u8(2, 0)?;
        builder.store_u8(2, 0)?;

        builder.store_reference(&wallet_code)?;
        builder.store_reference(&content)?;

        Ok(Arc::new(builder.build()?))
    }
    */
}
