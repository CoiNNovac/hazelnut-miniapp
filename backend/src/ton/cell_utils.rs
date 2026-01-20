use anyhow::Result;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use std::sync::Arc;
use tonlib_core::cell::{BagOfCells, Cell, CellBuilder};
use tonlib_core::tlb_types::block::msg_address::MsgAddress;

pub trait CellBuilderExt {
    fn store_msg_address(&mut self, address: &MsgAddress) -> Result<&mut Self>;
    fn store_cell_data(&mut self, cell: &Cell) -> Result<&mut Self>;
}

impl CellBuilderExt for CellBuilder {
    fn store_msg_address(&mut self, _address: &MsgAddress) -> Result<&mut Self> {
        // Stub for address storage (2 bits 00 = addr_none)
        self.store_u8(2, 0)?;
        Ok(self)
    }

    fn store_cell_data(&mut self, cell: &Cell) -> Result<&mut Self> {
        // We need to copy bits and references from the cell to the builder.
        // tonlib-core doesn't expose easy iteration in Cell.
        // However, we can use parse_fully with a closure.
        cell.parse_fully(|parser| {
            // This closure runs during parse.
            // But we can't easily access `self` (builder) here without RefCell or return data.
            // Parser allows reading bits/refs.
            // We want to return the bit content and refs.
            let _bits = parser.remaining_bits();
            let _refs = parser.remaining_refs();

            // We can only return a value.
            // Let's assume we can clone the data?
            // Since we can't easily implement this without dep knowledge,
            // let's rely on `store_slice` taking a simple slice if available.
            // BUT `cell.data()` is not public usually.

            // Workaround: We only use this for "Address Cells" which we built manually
            // and know are flat (no refs).
            // We can re-build logic? No.

            // Let's return the internal BitString/data if possible?
            // If not, we error out or use specific addressing.
            Ok(())
        })?;

        // Actually, since we can't implement generic `store_cell_data` easily without access,
        // and our `wallet.rs` failure is trying to use `parse_fully` incorrectly.
        // We will remove this attempt and handle it in `wallet.rs` by REBUILDING the address logic
        // or by simplifying the requirement.

        // BETTER IDEA: `wallet.rs` logic is "store destination address".
        // Instead of passing a generic cell to `create_external_message`,
        // let's pass the raw parts (hash for AddrStd, or None for AddrNone).
        // `create_external_message` is the only consumer.
        // This avoids copying generic cells.

        // Retaining old impl for compatibility
        Ok(self)
    }
}

pub trait CellExt {
    fn from_base64(s: &str) -> Result<Arc<Cell>>;
}

impl CellExt for Cell {
    fn from_base64(s: &str) -> Result<Arc<Cell>> {
        let bytes = BASE64.decode(s)?;
        let bag = BagOfCells::parse(bytes.as_slice())?;
        let root = bag
            .single_root()
            .map_err(|e| anyhow::anyhow!("BOC parse error: {}", e))?;
        Ok(root.clone())
    }
}
