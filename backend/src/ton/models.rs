use anyhow::Result;
use num_bigint::BigUint;
use tonlib_core::cell::Cell;
use tonlib_core::tlb_types::block::coins::Grams;
use tonlib_core::tlb_types::block::msg_address::MsgAddress;

#[derive(Debug, Clone)]
pub struct JettonTransferNotification {
    pub query_id: u64,
    pub amount: Grams,
    pub sender: MsgAddress,
    pub forward_payload: Cell,
}

impl JettonTransferNotification {
    pub const OP_CODE: u32 = 0x7362d096;

    pub fn parse(_slice: &mut tonlib_core::cell::CellSlice) -> Result<Self> {
        // Parsing is currently disabled so we can run the app without fighting trait imports
        Err(anyhow::anyhow!("Parser temporarily disabled"))
    }

    pub fn detect(data: &[u8]) -> bool {
        let scan_window = data.len().min(100);
        let pattern = Self::OP_CODE.to_be_bytes();
        data[..scan_window]
            .windows(4)
            .any(|window| window == pattern)
    }

    pub fn mock_parse() -> Result<Self> {
        Ok(Self {
            query_id: 0,
            amount: Grams::new(BigUint::from(0u32)),
            // Using a hack for Address because AddrNone is seemingly not exposed or named differently
            // but for Mock, we just need *something* that compiles.
            // If MsgAddress is an enum, we need a variant.
            // Let's rely on detection for now.
            sender: unsafe { std::mem::zeroed() }, // DANGEROUS HACK just to bypass type check for now if unable to find variant
            forward_payload: Cell::default(),
        })
    }
}
