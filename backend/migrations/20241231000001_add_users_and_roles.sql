-- Create UUID extension if it doesn't exist (useful for IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'farmer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(255) UNIQUE NOT NULL, -- TON Wallet Address acts as username
    role user_role NOT NULL DEFAULT 'farmer',
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookup by address
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
