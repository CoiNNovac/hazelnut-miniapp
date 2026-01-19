-- Enhance campaigns table with mint tracking
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mint_amount NUMERIC(78, 0),
ADD COLUMN IF NOT EXISTS mint_tx_hash VARCHAR(255);

-- Create campaign token mints tracking table
CREATE TABLE IF NOT EXISTS campaign_token_mints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_address VARCHAR(255) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    tx_hash VARCHAR(255),
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_mints_campaign ON campaign_token_mints(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_mints_recipient ON campaign_token_mints(recipient_address);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(255) NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    mkoin_paid NUMERIC(78, 0) NOT NULL,
    tokens_received NUMERIC(78, 0) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_address);
CREATE INDEX IF NOT EXISTS idx_purchases_campaign ON purchases(campaign_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_tx_hash ON purchases(tx_hash);

-- Comments for documentation
COMMENT ON TABLE campaign_token_mints IS 'Tracks when campaign tokens are minted. Currently records mints on MKOIN contract, will track actual Jetton deployments later.';
COMMENT ON TABLE purchases IS 'User token purchases. Tracks MKOIN payments and token allocations.';
COMMENT ON COLUMN purchases.status IS 'pending: awaiting blockchain confirmation, confirmed: verified on chain, failed: transaction failed';
