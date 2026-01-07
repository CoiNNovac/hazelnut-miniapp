-- Update Users Table (idempotent)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Create Campaign Status Enum
DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('pending', 'running', 'paused', 'finished', 'rejected', 'cancelled', 'approved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    token_name VARCHAR(255) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL,
    token_supply VARCHAR(255) NOT NULL, -- using string for large numbers
    logo_url TEXT,
    image_url TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    suggested_price NUMERIC(78, 0) NOT NULL, -- or string, keeping consistent with other numeric fields
    status campaign_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_farmer ON campaigns(farmer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Seed initial superadmin
INSERT INTO users (username, role, name, address, password_hash) 
VALUES (
    'admin', 
    'superadmin', 
    'Super Admin', 
    '0x0000000000000000000000000000000000000000',
    '$argon2id$v=19$m=19456,t=2,p=1$Jzw4nzQP8wP2VtQTSWcIFg$aIWAI4XssKHjc4TMIdBIctIUMtW26FdiLrwJGKcK0OA'
) 
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash;
