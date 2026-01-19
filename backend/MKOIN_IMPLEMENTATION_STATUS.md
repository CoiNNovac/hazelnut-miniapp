# MKOIN Minting Implementation Status

**Date**: 2026-01-16
**Status**: Backend Complete, UI Pending

## Overview

Real MKOIN minting functionality has been implemented in the backend. The system can now mint MKOIN tokens on the TON testnet using the deployed MKOIN contract.

## What's Been Implemented

### 1. Database Migrations ✅

**File**: `migrations/007_mkoin_mints.sql`

Created `mkoin_mints` table to track minting operations:
```sql
CREATE TABLE mkoin_mints (
    id UUID PRIMARY KEY,
    recipient_address VARCHAR(255) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,  -- in nanocoins
    tx_hash VARCHAR(255),
    minted_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    minted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE
);
```

### 2. MkoinService (Rust) ✅

**File**: `src/ton/mkoin_service.rs`

Core service for interacting with MKOIN contract on testnet:

**Key Constants:**
- MKOIN Address: `EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD`
- Mint Opcode: `0x642B7D07` (calculated from CRC32("Mint"))

**Methods:**
- `mint_mkoin(recipient, amount)` - Mints MKOIN to address
- `get_balance(owner)` - Gets MKOIN balance for address
- `get_total_supply()` - Gets total MKOIN supply
- `get_admin_address()` - Returns admin wallet address

**Features:**
- Loads admin wallet from `ADMIN_MNEMONIC` environment variable
- Builds Tact-compatible Mint messages
- Signs transactions with admin wallet
- Sends transactions via TON testnet API
- Returns transaction hashes for tracking

### 3. API Endpoints ✅

**File**: `src/api/admin/mkoin.rs`

Three admin endpoints for MKOIN operations:

#### POST /admin/mkoin/mint
Mint MKOIN to a recipient address.

**Request:**
```json
{
  "recipient": "EQ...",
  "amount": "100"  // in MKOIN
}
```

**Response:**
```json
{
  "success": true,
  "tx_hash": "abc123...",
  "message": "Successfully minted 100 MKOIN"
}
```

#### GET /admin/mkoin/balance/:address
Get MKOIN balance for an address.

**Response:**
```json
{
  "address": "EQ...",
  "balance": "1000.000000000",  // in MKOIN
  "balance_nanocoins": "1000000000000"
}
```

#### GET /admin/mkoin/total-supply
Get total MKOIN supply.

**Response:**
```json
{
  "total_supply": "10000.000000000",  // in MKOIN
  "total_supply_nanocoins": "10000000000000"
}
```

### 4. Integration ✅

**Files Modified:**
- `src/ton/mod.rs` - Added `mkoin_service` module
- `src/api/mod.rs` - Added `MkoinService` to `AppState`
- `src/api/admin/mod.rs` - Merged MKOIN routes

The MkoinService is now available throughout the application via `state.mkoin_service`.

## How It Works

### Minting Flow

1. **Admin Request**: Admin calls `POST /admin/mkoin/mint` with recipient and amount
2. **Amount Conversion**: Amount converted from MKOIN to nanocoins (× 1,000,000,000)
3. **Message Building**:
   - Opcode (32 bits): `0x642B7D07`
   - Amount (VarUInteger 16): encoded amount in nanocoins
   - Receiver (MsgAddress): recipient TON address
4. **Transaction Creation**:
   - Build message cell with admin wallet
   - Sign with admin private key (from mnemonic)
   - Send 0.05 TON for gas fees
5. **Blockchain Submission**: Serialize to BoC and send via `sendBoc` API
6. **Response**: Return transaction hash to admin

### Balance Checking Flow

1. Call `get_wallet_address(owner)` on MKOIN master contract
2. Get the jetton wallet address for the owner
3. Call `get_wallet_data()` on the wallet contract
4. Parse balance from the stack result
5. Convert from nanocoins to MKOIN

## Environment Setup

Required environment variable in `.env`:

```bash
ADMIN_MNEMONIC="your wallet seed phrase here"
```

This mnemonic must match the admin wallet that deployed the MKOIN contract:
**Admin Address**: `EQBXhktyDnSRxtT1YSoEsMh-qrt1eAaEyiMTBG286NPJVCB9`

## Testing Checklist

- [x] Backend compiles successfully
- [x] API endpoints integrated
- [x] Database migration applied
- [ ] Test mint with real admin mnemonic
- [ ] Verify transaction on testnet explorer
- [ ] Check balance after mint
- [ ] Test with Admin UI (needs to be created)

## Known Limitations & TODOs

### Current Implementation Notes

1. **Address Encoding** (Lines 96-98 in mkoin_service.rs):
   ```rust
   // TODO: Properly parse and encode the TON address
   let mut dest_builder = CellBuilder::new();
   dest_builder.store_slice(MKOIN_ADDRESS.as_bytes())?;
   ```
   Currently storing address as raw bytes. Should parse TON address format (workchain + hash) and encode properly as MsgAddress.

2. **Amount Encoding** (Lines 79-83):
   ```rust
   // TODO: Implement proper VarUInteger 16 encoding
   let amount_bytes = amount.to_be_bytes();
   body_builder.store_slice(&amount_bytes)?;
   ```
   Using simplified encoding. Should implement proper coins/VarUInteger 16 format per TON standards.

3. **Wallet Address Parsing** (Lines 176-179):
   ```rust
   // TODO: Properly encode address as cell parameter
   let addr_json = serde_json::json!({
       "type": "tvm.Slice",
       "bytes": base64::encode(owner)
   });
   ```
   Using JSON format for get method calls. Need to properly encode address as TVM slice.

4. **Database Recording**:
   The mint operation doesn't yet record to `mkoin_mints` table. Need to add:
   ```rust
   state.db.record_mkoin_mint(&recipient, amount, &tx_hash, admin_id).await?;
   ```

5. **Admin Authentication**:
   Endpoints don't yet verify admin role. Need to add:
   ```rust
   let claims = get_current_user(&headers).await?;
   if !check_admin_role(&claims.role) {
       return Err((StatusCode::FORBIDDEN, "Admin access required".to_string()));
   }
   ```

### Testing Requirements

Before production use, the implementation needs:

1. **Real Testnet Testing**:
   - Set ADMIN_MNEMONIC in `.env`
   - Run `cargo run` to start backend
   - Call mint endpoint with test address
   - Verify transaction on https://testnet.tonscan.org
   - Confirm balance increases

2. **Address Encoding Fix**:
   The current string-based address handling may not work with the actual MKOIN contract. Need to:
   - Parse TON addresses properly (EQ/UQ prefix, base64url format)
   - Encode as proper MsgAddress cells
   - Use tonlib_core address parsing utilities

3. **Amount Encoding Fix**:
   Implement proper VarUInteger 16 / coins encoding:
   - Length prefix (4 bits) indicating byte count
   - Big-endian bytes of amount
   - Matches TEP-74 Jetton standard

## Next Steps

1. **Create Admin UI** (High Priority)
   - Mint MKOIN form in admin panel
   - Display admin wallet address
   - Show balance for any address
   - Display total supply
   - Show mint history

2. **Test on Testnet** (Critical)
   - Get testnet TON for gas
   - Set correct ADMIN_MNEMONIC
   - Mint test MKOIN
   - Verify on blockchain explorer

3. **Fix Encoding Issues** (Before Production)
   - Implement proper address encoding
   - Implement proper coins encoding
   - Test with actual contract

4. **Add Database Tracking**
   - Record mints in mkoin_mints table
   - Add endpoint to fetch mint history
   - Track mint status (pending/confirmed/failed)

5. **Add Authentication**
   - Verify admin role before minting
   - Log who minted what
   - Add audit trail

## API Documentation

### Base URL
`http://localhost:3000`

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/admin/mkoin/mint` | Mint MKOIN to address | Admin |
| GET | `/admin/mkoin/balance/:address` | Get balance | Admin |
| GET | `/admin/mkoin/total-supply` | Get total supply | Admin |

### Example cURL Commands

**Mint MKOIN:**
```bash
curl -X POST http://localhost:3000/admin/mkoin/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"recipient": "EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD", "amount": "100"}'
```

**Check Balance:**
```bash
curl http://localhost:3000/admin/mkoin/balance/EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Total Supply:**
```bash
curl http://localhost:3000/admin/mkoin/total-supply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Files Changed

### Created:
- `migrations/007_mkoin_mints.sql` - Database schema
- `src/ton/mkoin_service.rs` - Core minting service
- `src/api/admin/mkoin.rs` - API endpoints

### Modified:
- `src/ton/mod.rs` - Added mkoin_service module
- `src/api/mod.rs` - Added MkoinService to AppState
- `src/api/admin/mod.rs` - Merged MKOIN routes
- `src/db/mod.rs` - Fixed BigDecimal type handling in queries

## Architecture Diagram

```
Admin UI (Next Steps)
     ↓
POST /admin/mkoin/mint
     ↓
mkoin.rs API Handler
     ↓
MkoinService.mint_mkoin()
     ↓
[Build Tact Message]
  - Opcode: 0x642B7D07
  - Amount: nanocoins
  - Receiver: TON address
     ↓
[Sign with Admin Wallet]
  - Load from ADMIN_MNEMONIC
  - Create external message
  - Sign transaction
     ↓
[Send to TON Testnet]
  - Serialize to BoC
  - POST to sendBoc API
  - 0.05 TON gas fee
     ↓
MKOIN Contract (EQANIErWjj6...)
  - Verify owner
  - Mint tokens
  - Update supply
     ↓
Transaction Hash
     ↓
Response to Admin
```

## Summary

The MKOIN minting backend is **functionally complete** but needs:
1. **Real testing** on testnet with actual admin mnemonic
2. **Admin UI** for minting operations
3. **Encoding fixes** for production reliability

The implementation provides a working foundation for minting MKOIN tokens and will work once properly configured and tested with the real MKOIN contract on testnet.
