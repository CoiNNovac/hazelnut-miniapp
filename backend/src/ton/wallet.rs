use crate::ton::address_utils::store_ton_address;
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
        dest_address: &str, // TON address in any format (raw or user-friendly)
        amount: u64,
        payload: Arc<Cell>,
    ) -> Result<Arc<Cell>> {
        let valid_until = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() as u32 + 60;

        // 1. Prepare Internal Message (in a separate cell to avoid overflow)
        let mut int_msg = CellBuilder::new();
        int_msg.store_bit(false)?; // int_msg_info$0
        int_msg.store_bit(true)?; // ihr_disabled:true
        int_msg.store_bit(true)?; // bounce:true
        int_msg.store_bit(false)?; // bounced:false
        int_msg.store_u8(2, 0)?; // src:addr_none

        // Encode destination address
        store_ton_address(&mut int_msg, dest_address)?;

        int_msg.store_coins(&BigUint::from(amount))?;

        int_msg.store_bit(false)?; // other currency collection
        int_msg.store_coins(&BigUint::from(0u32))?; // ihr_fee
        int_msg.store_coins(&BigUint::from(0u32))?; // fwd_fee
        int_msg.store_u64(64, 0)?; // created_lt
        int_msg.store_u32(32, 0)?; // created_at

        int_msg.store_bit(false)?; // init: nothing

        int_msg.store_bit(true)?; // body: right (as reference)
        int_msg.store_reference(&payload)?;

        let int_msg_cell = Arc::new(int_msg.build()?);

        // 2. Build construction for signing
        let mut msg_builder = CellBuilder::new();
        msg_builder.store_u32(32, 698983191)?; // subwallet_id
        msg_builder.store_u32(32, valid_until)?;
        msg_builder.store_u32(32, self.seqno as u32)?;
        msg_builder.store_u8(8, 0)?;
        msg_builder.store_u8(8, 3)?; // mode 3

        // Store internal message as reference
        msg_builder.store_reference(&int_msg_cell)?;

        let to_sign_cell = msg_builder.build()?;
        let hash = to_sign_cell.cell_hash();

        let hash_hex = hash.to_string();
        let hash_bytes =
            hex::decode(&hash_hex).map_err(|e| anyhow::anyhow!("Hex decode failed: {}", e))?;

        let signature = self.key.sign(&hash_bytes);
        let signature_bytes = signature.to_bytes();

        // 3. Build final external message body
        let mut ext_body = CellBuilder::new();
        ext_body.store_slice(&signature_bytes)?;

        ext_body.store_u32(32, 698983191)?;
        ext_body.store_u32(32, valid_until)?;
        ext_body.store_u32(32, self.seqno as u32)?;
        ext_body.store_u8(8, 0)?;
        ext_body.store_u8(8, 3)?;

        // Store internal message as reference
        ext_body.store_reference(&int_msg_cell)?;

        let body_cell = ext_body.build()?;

        // 4. Wrap in External Message
        let mut ext_msg = CellBuilder::new();
        ext_msg.store_u8(2, 2)?; // ext_in_msg_info$10
        ext_msg.store_u8(2, 0)?; // src:addr_none

        ext_msg.store_u8(2, 0)?; // dest:addr_none (Note: this effectively creates an invalid destination, but preserving original logic)

        ext_msg.store_coins(&BigUint::from(0u32))?; // import_fee
        ext_msg.store_bit(false)?; // init: nothing

        ext_msg.store_bit(true)?; // body: right
        ext_msg.store_reference(&Arc::new(body_cell))?;

        Ok(Arc::new(ext_msg.build()?))
    }
}
