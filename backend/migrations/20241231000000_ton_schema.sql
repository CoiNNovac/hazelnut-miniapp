-- Drop EVM tables if they exist
DROP TABLE IF EXISTS transaction_logs CASCADE;
DROP TABLE IF EXISTS token_balances CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TYPE IF EXISTS token_type;

-- Create TON specific tables
CREATE TABLE IF NOT EXISTS token_minters (
    address VARCHAR(255) PRIMARY KEY,
    symbol VARCHAR(255),
    metadata_url TEXT,
    is_agri_token BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    user_address VARCHAR(255) NOT NULL,
    token_address VARCHAR(255) NOT NULL,
    balance NUMERIC(78, 0) NOT NULL DEFAULT 0,
    last_updated_lt BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_address, token_address)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_address);
