-- Add token_address column to campaigns table (idempotent)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS token_address VARCHAR(255);

-- Add index for token_address lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_campaigns_token_address ON campaigns(token_address);

-- Add comment explaining the column
COMMENT ON COLUMN campaigns.token_address IS 'TON blockchain address of the minted token (EQ... format)';
