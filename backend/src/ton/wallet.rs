use crate::ton::cell_utils::CellBuilderExt;
use anyhow::Result;
use ed25519_dalek::{Signer, SigningKey};
use num_bigint::BigUint;
use rand::RngCore;
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tonlib_core::cell::{Cell, CellBuilder};

pub struct Wallet {
    pub key: SigningKey,
    pub address: String,
    pub seqno: u64,
}

impl Wallet {
    pub fn new_random() -> Self {
        let mut csprng = OsRng;
        let mut bytes = [0u8; 32];
        csprng.fill_bytes(&mut bytes);
        let key = SigningKey::from_bytes(&bytes);
        Self {
            key,
            address: "EQ_GENERATED_WALLET_ADDR".to_string(),
            seqno: 0,
        }
    }

    pub fn from_seed(seed: &str) -> Result<Self> {
        let mut hasher = Sha256::new();
        hasher.update(seed.as_bytes());
        let result = hasher.finalize();
        let bytes: [u8; 32] = result.into();

        let key = SigningKey::from_bytes(&bytes);
        let address_mock = format!("EQ_WALLET_{}", hex::encode(&bytes[0..4]));

        Ok(Self {
            key,
            address: address_mock,
            seqno: 0,
        })
    }

    pub fn create_external_message(
        &self,
        dest_addr_cell: Arc<Cell>, // Bypass MsgAddress type issue
        amount: u64,
        payload: Arc<Cell>,
    ) -> Result<Arc<Cell>> {
        let valid_until = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() as u32 + 60;

        let mut msg_builder = CellBuilder::new();
        msg_builder.store_u32(32, 698983191)?;
        msg_builder.store_u32(32, valid_until)?;
        msg_builder.store_u32(32, self.seqno as u32)?;
        msg_builder.store_u8(8, 0)?;
        msg_builder.store_u8(8, 3)?;

        msg_builder.store_bit(false)?;
        msg_builder.store_bit(true)?;
        msg_builder.store_bit(true)?;
        msg_builder.store_bit(false)?;
        msg_builder.store_u8(2, 0)?;

        msg_builder.store_cell_data(&dest_addr_cell)?;

        msg_builder.store_coins(&BigUint::from(amount))?;

        msg_builder.store_bit(false)?;
        msg_builder.store_coins(&BigUint::from(0u32))?;
        msg_builder.store_coins(&BigUint::from(0u32))?;
        msg_builder.store_u64(64, 0)?;
        msg_builder.store_u32(32, 0)?;

        msg_builder.store_bit(false)?;

        msg_builder.store_bit(true)?;
        msg_builder.store_reference(&payload)?;

        let to_sign_cell = msg_builder.build()?;
        let hash = to_sign_cell.cell_hash();

        let hash_hex = hash.to_string();
        let hash_bytes =
            hex::decode(&hash_hex).map_err(|e| anyhow::anyhow!("Hex decode failed: {}", e))?;

        let signature = self.key.sign(&hash_bytes);
        let signature_bytes = signature.to_bytes();

        let mut ext_body = CellBuilder::new();
        ext_body.store_slice(&signature_bytes)?;

        ext_body.store_u32(32, 698983191)?;
        ext_body.store_u32(32, valid_until)?;
        ext_body.store_u32(32, self.seqno as u32)?;
        ext_body.store_u8(8, 0)?;
        ext_body.store_u8(8, 3)?;

        ext_body.store_bit(false)?;
        ext_body.store_bit(true)?;
        ext_body.store_bit(true)?;
        ext_body.store_bit(false)?;
        ext_body.store_u8(2, 0)?;

        ext_body.store_cell_data(&dest_addr_cell)?;

        ext_body.store_coins(&BigUint::from(amount))?;

        ext_body.store_bit(false)?;
        ext_body.store_coins(&BigUint::from(0u32))?;
        ext_body.store_coins(&BigUint::from(0u32))?;
        ext_body.store_u64(64, 0)?;
        ext_body.store_u32(32, 0)?;

        ext_body.store_bit(false)?;
        ext_body.store_bit(true)?;
        ext_body.store_reference(&payload)?;

        let body_cell = ext_body.build()?;

        let mut ext_msg = CellBuilder::new();
        ext_msg.store_u8(2, 2)?;
        ext_msg.store_u8(2, 0)?;

        ext_msg.store_u8(2, 0)?;

        ext_msg.store_coins(&BigUint::from(0u32))?;
        ext_msg.store_bit(false)?;

        ext_msg.store_bit(true)?;
        ext_msg.store_reference(&Arc::new(body_cell))?;

        Ok(Arc::new(ext_msg.build()?))
    }
}
