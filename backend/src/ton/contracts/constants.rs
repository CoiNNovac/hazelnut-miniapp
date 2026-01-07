// Standard Jetton Minter Code (TEP-74)
// Source: https://github.com/ton-blockchain/token-contract
// CURRENT STATUS: Using minimal valid BOC (empty root cell) to satisfy parser.
// TODO: Replace with actual compiled FunC bytecode for production.

// Minimal valid BOC with one empty cell: b5ee9c72410101010002000000 -> te6cckEBAQEAAgAA
pub const JETTON_MINTER_CODE_B64: &str = "te6cckEBAQEAAgAA";
pub const JETTON_WALLET_CODE_B64: &str = "te6cckEBAQEAAgAA";
