-- Add MKOIN contract to token_minters table
-- This is the base stablecoin (1 MKOIN = 1 EUR) that all campaign tokens will be minted on

INSERT INTO token_minters (address, symbol, metadata_url, is_agri_token, created_at)
VALUES (
    'EQANIErWjj6U4FNgSfEHwR6x-bkkJCV1n5w1OIb-Pf6eWQwD',
    'MKOIN',
    'https://mkoin.io/metadata.json',
    false,
    NOW()
)
ON CONFLICT (address) DO UPDATE SET
    symbol = EXCLUDED.symbol,
    metadata_url = EXCLUDED.metadata_url,
    updated_at = NOW();

-- Add comment for clarity
COMMENT ON TABLE token_minters IS 'Stores TON token contract addresses. MKOIN is the base stablecoin, is_agri_token=true for farmer campaign tokens';
