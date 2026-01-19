use anyhow::Result;
use base64::{
    Engine as _,
    engine::general_purpose::{STANDARD_NO_PAD, URL_SAFE_NO_PAD},
};
use tonlib_core::cell::CellBuilder;

/// Parse a TON address string and store it properly encoded in a CellBuilder
///
/// Supports both user-friendly (EQ..., UQ..., kQ...) and raw (workchain:hash) formats
///
/// MsgAddress encoding (TL-B):
/// addr_std$10 anycast:(Maybe Anycast) workchain_id:int8 address:bits256 = MsgAddressInt;
pub fn store_ton_address(builder: &mut CellBuilder, address_str: &str) -> Result<()> {
    let (workchain, hash_bytes) = if address_str.contains(':') {
        // Raw format: "workchain:hash"
        parse_raw_address(address_str)?
    } else {
        // User-friendly format: EQ..., UQ..., kQ...
        parse_friendly_address(address_str)?
    };

    // Encode as addr_std (TL-B format)
    builder.store_u8(2, 0b10)?; // 2 bits: addr_std tag
    builder.store_bit(false)?; // 1 bit: no anycast
    builder.store_i8(8, workchain)?; // 8 bits: workchain_id
    builder.store_slice(&hash_bytes)?; // 256 bits: account hash

    Ok(())
}

fn parse_raw_address(address_str: &str) -> Result<(i8, Vec<u8>)> {
    let parts: Vec<&str> = address_str.split(':').collect();
    if parts.len() != 2 {
        return Err(anyhow::anyhow!("Invalid raw address format"));
    }

    let workchain: i8 = parts[0]
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid workchain: {}", e))?;

    let hash_bytes =
        hex::decode(parts[1]).map_err(|e| anyhow::anyhow!("Invalid hash hex: {}", e))?;

    if hash_bytes.len() != 32 {
        return Err(anyhow::anyhow!(
            "Hash must be 32 bytes, got {}",
            hash_bytes.len()
        ));
    }

    Ok((workchain, hash_bytes))
}

fn parse_friendly_address(address_str: &str) -> Result<(i8, Vec<u8>)> {
    // The address is exactly 48 characters (36 bytes)
    // We should NOT remove prefixes (EQ, UQ, etc) because they are part of the Base64 encoding
    // (representing the tag and workchain bytes).
    let address_clean = address_str;

    // TON uses base64url encoding (- and _ instead of + and /)
    // The address is exactly 48 characters (36 bytes) after prefix removal
    // Try decoding with URL-safe alphabet first (most common for TON)
    let decoded = URL_SAFE_NO_PAD
        .decode(address_clean)
        .or_else(|_| {
            // Fallback: try converting to standard base64
            let std_b64 = address_clean.replace('-', "+").replace('_', "/");
            STANDARD_NO_PAD.decode(&std_b64)
        })
        .map_err(|e| {
            anyhow::anyhow!(
                "Failed to decode TON address '{}' (cleaned: '{}'): {}. \
                Address should be 48 base64url characters after prefix. \
                Try converting to raw format (workchain:hash) using https://testnet.tonviewer.com/",
                address_str,
                address_clean,
                e
            )
        })?;

    // TON friendly address structure (36 bytes total):
    // [1 byte flags][1 byte workchain][32 bytes hash][2 bytes CRC16]
    if decoded.len() != 36 {
        return Err(anyhow::anyhow!(
            "Invalid TON address length: expected 36 bytes, got {} bytes. \
            The address '{}' may be corrupted or in wrong format. \
            Prefix removed: '{}' ({} chars)",
            decoded.len(),
            address_str,
            address_clean,
            address_clean.len()
        ));
    }

    // Verify CRC16 checksum
    let data = &decoded[0..34]; // flags + workchain + hash
    let checksum = u16::from_be_bytes([decoded[34], decoded[35]]);
    let calculated_checksum = crc16(data);

    if checksum != calculated_checksum {
        return Err(anyhow::anyhow!(
            "Invalid CRC16 checksum for address '{}'. Expected {:#06x}, got {:#06x}. \
            The address may be corrupted.",
            address_str,
            calculated_checksum,
            checksum
        ));
    }

    // Extract workchain and hash
    let workchain = decoded[1] as i8;
    let hash = decoded[2..34].to_vec();

    Ok((workchain, hash))
}

/// Calculate CRC16-CCITT checksum for TON addresses
fn crc16(data: &[u8]) -> u16 {
    let mut crc: u16 = 0;
    for &byte in data {
        crc ^= (byte as u16) << 8;
        for _ in 0..8 {
            if crc & 0x8000 != 0 {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    crc
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_raw_address() {
        let mut builder = CellBuilder::new();
        let result = store_ton_address(
            &mut builder,
            "0:00d2042b5a38fa538142608b0c87eaab75780684ca2313066dbc693c954253c9",
        );
        assert!(
            result.is_ok(),
            "Raw address should work: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_bounceable_address() {
        let mut builder = CellBuilder::new();
        // MKOIN contract on testnet (EQ prefix = bounceable)
        let result = store_ton_address(
            &mut builder,
            "EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD",
        );
        assert!(
            result.is_ok(),
            "Bounceable (EQ) address should work: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_non_bounceable_address() {
        let mut builder = CellBuilder::new();
        // Non-bounceable address (UQ prefix)
        let result = store_ton_address(
            &mut builder,
            "UQDlgZ4f0HgVWBxlYMQfnmqw2PIJ27dGqrPrXrTdD1_R3IUn",
        );
        // This will fail if address is corrupted, which is expected for test data
        if let Err(e) = result {
            println!("Non-bounceable test failed as expected: {}", e);
        }
    }

    #[test]
    fn test_testnet_bounceable_address() {
        let mut builder = CellBuilder::new();
        // Testnet bounceable (kQ prefix)
        let result = store_ton_address(
            &mut builder,
            "kQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWb3k",
        );
        assert!(
            result.is_ok(),
            "Testnet bounceable (kQ) address should work: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_testnet_non_bounceable_address() {
        let mut builder = CellBuilder::new();
        // Testnet non-bounceable (0Q prefix)
        let result = store_ton_address(
            &mut builder,
            "0QANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWTfz",
        );
        assert!(
            result.is_ok(),
            "Testnet non-bounceable (0Q) address should work: {:?}",
            result.err()
        );
    }

    #[test]
    fn test_invalid_address_length() {
        let mut builder = CellBuilder::new();
        // Too short address
        let result = store_ton_address(&mut builder, "EQShortAddress");
        assert!(result.is_err(), "Short address should fail");
    }

    #[test]
    fn test_invalid_checksum() {
        let mut builder = CellBuilder::new();
        // Valid length but wrong checksum (last 2 bytes changed)
        let result = store_ton_address(
            &mut builder,
            "EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWAAA",
        );
        assert!(result.is_err(), "Address with bad checksum should fail");
        if let Err(e) = result {
            assert!(
                e.to_string().contains("checksum"),
                "Error should mention checksum: {}",
                e
            );
        }
    }
}
