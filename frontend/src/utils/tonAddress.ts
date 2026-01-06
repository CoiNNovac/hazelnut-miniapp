/**
 * Convert TON address from raw format to user-friendly format
 * Raw format: "0:hex" or "-1:hex"
 * User-friendly format: "UQxxx" (base64url)
 */

// CRC16-CCITT lookup table
const crc16Table = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let crc = i << 8;
  for (let j = 0; j < 8; j++) {
    crc = (crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0);
  }
  crc16Table[i] = crc & 0xffff;
}

function crc16(data: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ crc16Table[((crc >> 8) ^ data[i]) & 0xff]) & 0xffff;
  }
  return crc;
}

// Base64url encoding (without padding)
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function convertToUserFriendly(rawAddress: string): string {
  try {
    // Parse raw address: "0:hex" or "-1:hex"
    const parts = rawAddress.split(':');
    if (parts.length !== 2) {
      return rawAddress; // Return as-is if format is unexpected
    }

    const workchain = parseInt(parts[0]);
    const hexHash = parts[1];

    // Convert hex to bytes
    const hashBytes = new Uint8Array(
      hexHash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    if (hashBytes.length !== 32) {
      return rawAddress; // Invalid hash length
    }

    // Create address data: tag (1 byte) + workchain (1 byte) + hash (32 bytes)
    // Tag byte: 0x51 = bounceable + testOnly=false + urlSafe
    // Tag byte: 0x11 = non-bounceable + testOnly=false + urlSafe
    // Tonkeeper typically shows bounceable addresses (UQ prefix)
    const tag = 0x51; // bounceable, not test, urlSafe -> "UQ" prefix
    const addressData = new Uint8Array(34);
    addressData[0] = tag;
    addressData[1] = workchain & 0xff;
    addressData.set(hashBytes, 2);

    // Calculate CRC16
    const checksum = crc16(addressData);

    // Create final data with checksum
    const finalData = new Uint8Array(36);
    finalData.set(addressData);
    finalData[34] = (checksum >> 8) & 0xff;
    finalData[35] = checksum & 0xff;

    // Encode to base64url
    return base64UrlEncode(finalData);
  } catch (error) {
    console.error('Error converting address:', error);
    return rawAddress; // Return original on error
  }
}

export function formatAddress(address: string, start = 3, end = 4): string {
  if (!address) return 'Not connected';

  // Try to convert to user-friendly format first
  const userFriendly = address.includes(':') ? convertToUserFriendly(address) : address;

  return `${userFriendly.slice(0, start)}...${userFriendly.slice(-end)}`;
}
