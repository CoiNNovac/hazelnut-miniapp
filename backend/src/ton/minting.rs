use crate::db::Campaign;
use crate::ton::cell_utils::{CellBuilderExt, CellExt};
use crate::ton::client::Client;
use crate::ton::contracts::constants::{JETTON_MINTER_CODE_B64, JETTON_WALLET_CODE_B64};
use crate::ton::wallet::Wallet;
use anyhow::Result;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use bigdecimal::ToPrimitive;
use hex;
use num_bigint::BigUint;
use std::str::FromStr;
use std::sync::Arc;
use tonlib_core::cell::{BagOfCells, Cell, CellBuilder};
use tracing::{error, info};

pub struct MintingService {
    client: Client,
    server_wallet: Wallet,
}

impl MintingService {
    pub fn new() -> Self {
        let mnemonic = std::env::var("ADMIN_MNEMONIC")
            .unwrap_or_else(|_| "admin_seed_placeholder".to_string());

        let client = Client::new("https://toncenter.com/api/v2", None);

        let wallet = Wallet::from_seed(&mnemonic).unwrap_or_else(|_| {
            error!("Invalid seed, using random wallet");
            Wallet::new_random()
        });

        Self {
            client,
            server_wallet: wallet,
        }
    }

    pub async fn mint_campaign_token(&self, campaign: &Campaign) -> Result<String> {
        info!("Preparing to mint token for campaign: {}", campaign.name);

        let seqno = match self
            .client
            .get_wallet_seqno(&self.server_wallet.address)
            .await
        {
            Ok(s) => s,
            Err(e) => {
                error!("Failed to fetch seqno: {}", e);
                return Err(e);
            }
        };
        info!("Server wallet seqno: {}", seqno);

        let admin_address_cell = self.create_addr_none()?;
        let metadata = self.create_metadata_cell(campaign)?;

        let wallet_code = Cell::from_base64(JETTON_WALLET_CODE_B64)
            .map_err(|e| anyhow::anyhow!("Invalid Wallet Code B64: {}", e))?;

        let supply_float = f64::from_str(&campaign.token_supply).unwrap_or(0.0);
        let supply_coins = (supply_float * 1_000_000_000.0) as u128;

        let minter_data = self.create_jetton_minter_data(
            supply_coins,
            admin_address_cell.clone(),
            metadata,
            wallet_code,
        )?;

        let minter_code = Cell::from_base64(JETTON_MINTER_CODE_B64)
            .map_err(|e| anyhow::anyhow!("Invalid Minter Code B64: {}", e))?;

        let mut state_init_builder = CellBuilder::new();
        state_init_builder.store_bit(false)?;
        state_init_builder.store_bit(false)?;
        state_init_builder.store_bit(true)?;
        state_init_builder.store_reference(&minter_code)?;
        state_init_builder.store_bit(true)?;
        state_init_builder.store_reference(&minter_data)?;
        state_init_builder.store_bit(false)?;

        let state_init_cell = state_init_builder.build()?;

        let hash = state_init_cell.cell_hash();
        // Convert private TonHash to bytes via hex
        let hash_hex = hash.to_string();
        let hash_bytes = hex::decode(&hash_hex)?;

        // address_hex is just hash_hex
        let address_hex = &hash_hex;
        let minter_address_str = format!("0:{}", address_hex);

        info!("Calculated Minter Address: {}", minter_address_str);

        let mut minter_addr_builder = CellBuilder::new();
        minter_addr_builder.store_u8(2, 2)?;
        minter_addr_builder.store_u8(1, 0)?;
        minter_addr_builder.store_i8(8, 0)?;
        minter_addr_builder.store_slice(&hash_bytes)?;

        let minter_addr_cell = Arc::new(minter_addr_builder.build()?);

        let deploy_msg = self.server_wallet.create_external_message(
            minter_addr_cell,
            50_000_000,
            Arc::new(Cell::default()),
        )?;

        let bag = BagOfCells::from_root((*deploy_msg).clone());
        let boc_bytes = bag.serialize(false)?;
        let boc_base64 = BASE64.encode(boc_bytes);

        self.client.send_boc(&boc_base64).await?;

        info!("Minting transaction sent for {}", campaign.token_symbol);

        Ok(minter_address_str)
    }

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
}
