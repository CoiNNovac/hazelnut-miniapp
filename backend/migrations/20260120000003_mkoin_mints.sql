-- MKOIN Minting Tracking
-- Records when admin mints MKOIN to addresses

CREATE TABLE IF NOT EXISTS mkoin_mints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_address VARCHAR(255) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    tx_hash VARCHAR(255),
    minted_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mkoin_mints_recipient ON mkoin_mints(recipient_address);
CREATE INDEX IF NOT EXISTS idx_mkoin_mints_tx ON mkoin_mints(tx_hash);
CREATE INDEX IF NOT EXISTS idx_mkoin_mints_status ON mkoin_mints(status);

-- Comments
COMMENT ON TABLE mkoin_mints IS 'Tracks MKOIN token mints by admin to user addresses';
COMMENT ON COLUMN mkoin_mints.amount IS 'Amount in nanocoins (1 MKOIN = 1e9 nanocoins)';
COMMENT ON COLUMN mkoin_mints.status IS 'pending: awaiting blockchain confirmation, confirmed: verified on chain, failed: transaction failed';
