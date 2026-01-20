use crate::ton::address_utils::store_ton_address;
use crate::ton::cell_utils::CellBuilderExt;
use anyhow::{Context, Result};
use ed25519_dalek::{Signer, SigningKey, VerifyingKey};
use num_bigint::BigUint;
use rand::RngCore;
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tonlib_core::cell::{BagOfCells, Cell, CellBuilder};

// Wallet V5R1 Code (Hex Encoded) extracted from dump
const WALLET_V5R1_CODE_HEX: &str = "b5ee9c7241021401000281000114ff00f4a413f4bcf2c80b01020120020d020148030402dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120050c020120060902016e07080019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00201480a0b0017b325fb51341c75c875c2c7e00011b262fb513435c280200019be5f0f6a2684080a0eb90fa02c0102f20e011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0b4d6c35e";

const WALLET_ID_V5R1: u32 = 0x7fffff11; // -2147483409 (standard default for workchain 0)

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

        let mut wallet = Self {
            key,
            address: "".to_string(),
            seqno: 0,
        };
        wallet.address = wallet.calculate_address().unwrap_or_default();
        wallet
    }

    pub fn from_seed(seed: &str) -> Result<Self> {
        let mut hasher = Sha256::new();
        hasher.update(seed.as_bytes());
        let result = hasher.finalize();
        let bytes: [u8; 32] = result.into();

        let key = SigningKey::from_bytes(&bytes);

        let mut wallet = Self {
            key,
            address: "".to_string(),
            seqno: 0,
        };

        wallet.address = wallet.calculate_address().unwrap_or_else(|e| {
            println!(
                "Warning: Address calculation failed: {}. Using placeholder.",
                e
            );
            "PLEASE_SET_ADMIN_ADDRESS_IN_ENV".to_string()
        });
        Ok(wallet)
    }

    fn get_code(&self) -> Result<Arc<Cell>> {
        let clean_hex: String = WALLET_V5R1_CODE_HEX
            .chars()
            .filter(|c| !c.is_whitespace())
            .collect();

        let bytes = hex::decode(&clean_hex).context("Failed to decode wallet code hex")?;

        let boc = BagOfCells::parse(&bytes)?;
        let root = boc
            .roots
            .first()
            .context("No root cell in wallet code")?
            .clone();
        Ok(root)
    }

    fn get_data(&self) -> Result<Arc<Cell>> {
        let mut builder = CellBuilder::new();
        // V5R1 Data: seqno(32) | wallet_id(32) | public_key(256) | plugins(1)
        builder.store_u32(32, 0)?; // seqno = 0 for initial
        builder.store_u32(32, WALLET_ID_V5R1)?; // wallet_id

        let pubkey = VerifyingKey::from(&self.key);
        builder.store_slice(pubkey.as_bytes())?;

        builder.store_bit(false)?; // plugins: empty dict (0 bit)

        Ok(Arc::new(builder.build()?))
    }

    fn get_state_init(&self) -> Result<Arc<Cell>> {
        let code = self.get_code()?;
        let data = self.get_data()?;

        let mut builder = CellBuilder::new();
        builder.store_bit(false)?; // split_depth
        builder.store_bit(false)?; // special
        builder.store_bit(true)?; // code: present
        builder.store_reference(&code)?;
        builder.store_bit(true)?; // data: present
        builder.store_reference(&data)?;
        builder.store_bit(false)?; // library

        Ok(Arc::new(builder.build()?))
    }

    fn calculate_address(&self) -> Result<String> {
        let state_init = self.get_state_init()?;
        let hash = state_init.cell_hash();
        let workchain = 0i8;

        let address = format!("{}:{}", workchain, hash.to_string());
        Ok(address)
    }

    pub fn create_external_message(
        &self,
        dest_address: &str,
        amount: u64,
        payload: Arc<Cell>,
    ) -> Result<Arc<Cell>> {
        let valid_until = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() as u32 + 600;

        // 1. Build Internal Message (The Action)
        // action_send_msg#0ec3c86d mode:uint8 out_msg:^(MessageRelaxed Any) = OutAction;
        let mut int_msg = CellBuilder::new();
        int_msg.store_bit(false)?; // int_msg_info$0
        int_msg.store_bit(true)?; // ihr_disabled:true
        int_msg.store_bit(true)?; // bounce:true
        int_msg.store_bit(false)?; // bounced:false
        int_msg.store_u8(2, 0)?; // src:addr_none
        store_ton_address(&mut int_msg, dest_address)?;
        int_msg.store_coins(&BigUint::from(amount))?;
        int_msg.store_bit(false)?; // currency
        int_msg.store_coins(&BigUint::from(0u32))?; // ihr_fee
        int_msg.store_coins(&BigUint::from(0u32))?; // fwd_fee
        int_msg.store_u64(64, 0)?; // created_lt
        int_msg.store_u32(32, 0)?; // created_at
        int_msg.store_bit(false)?; // init: nothing
        int_msg.store_bit(true)?; // body: right
        int_msg.store_reference(&payload)?;

        let int_msg_cell = Arc::new(int_msg.build()?);

        // 2. Build Signing Payload & Inline Actions
        // signed_external#7369676e wallet_id:int32 valid_until:uint32 seqno:uint32 actions:OutListExternal
        // Fix for "Too new seqno": The contract likely reads `valid_until` as `seqno`.
        // This means there is an extra 32-bit field before seqno.
        // We will remove WalletID to realign the structure: [Op] [Until] [Seqno].

        let mut signing_builder = CellBuilder::new();
        signing_builder.store_u32(32, 0x7369676e)?; // signed_external
        // signing_builder.store_u32(32, WALLET_ID_V5R1)?; // Remove ID based on offset analysis
        signing_builder.store_u32(32, valid_until)?;
        signing_builder.store_u32(32, self.seqno as u32)?;

        // Actions List (Packed Inline)
        signing_builder.store_bit(true)?; // List Head Present

        // Action Content Packed Inline
        signing_builder.store_u32(32, 0x0ec3c86d)?; // action_send_msg
        signing_builder.store_u8(8, 3)?; // mode 3
        signing_builder.store_reference(&int_msg_cell)?; // The message reference

        signing_builder.store_bit(false)?; // Next = Empty

        let to_sign_cell = signing_builder.build()?;
        let hash = to_sign_cell.cell_hash();
        let hash_hex = hash.to_string();
        let hash_bytes =
            hex::decode(&hash_hex).map_err(|e| anyhow::anyhow!("Hex decode: {}", e))?;

        let signature = self.key.sign(&hash_bytes);
        let signature_bytes = signature.to_bytes();

        // 3. Final Body: Signature + SigningPayload
        let mut body_builder = CellBuilder::new();
        body_builder.store_slice(&signature_bytes)?;
        body_builder.store_cell_data(&to_sign_cell)?; // Embed the signed payload payload

        let body_cell = body_builder.build()?;

        // 4. External Message Wrapper
        let mut ext_msg = CellBuilder::new();
        ext_msg.store_u8(2, 2)?; // ext_in_msg_info$10
        ext_msg.store_u8(2, 0)?; // src:addr_none
        store_ton_address(&mut ext_msg, &self.address)?; // dest: wallet address
        ext_msg.store_coins(&BigUint::from(0u32))?; // import_fee

        if self.seqno == 0 {
            let state_init = self.get_state_init()?;
            ext_msg.store_bit(true)?;
            ext_msg.store_bit(true)?;
            ext_msg.store_reference(&state_init)?;
        } else {
            ext_msg.store_bit(false)?;
        }

        ext_msg.store_bit(true)?; // body: right
        ext_msg.store_reference(&Arc::new(body_cell))?; // Body is often in reference for V5 too

        Ok(Arc::new(ext_msg.build()?))
    }
}
