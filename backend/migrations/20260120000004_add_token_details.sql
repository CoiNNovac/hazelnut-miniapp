-- Add total_supply and campaign_id to token_minters
ALTER TABLE token_minters 
ADD COLUMN IF NOT EXISTS total_supply NUMERIC(78, 0),
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);
