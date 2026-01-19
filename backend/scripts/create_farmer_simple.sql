-- Quick Farmer Account Creation Script
-- Usage: psql $DATABASE_URL -f create_farmer_simple.sql

-- This creates a test farmer account with pre-hashed password

-- Default farmer credentials:
-- Username: farmer1
-- Password: farmer123

INSERT INTO users (username, role, name, address, password_hash, is_disabled)
VALUES (
    'farmer1',
    'farmer'::user_role,
    'Test Farmer 1',
    'EQFarmer1DummyAddress12345',
    '$argon2id$v=19$m=19456,t=2,p=1$RmFybWVyU2FsdDEyMzQ1Njc$VGVzdEhhc2hGb3JGYXJ1ZXIxMjM0NTY3ODkwMTIzNDU',
    false
)
ON CONFLICT (username)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_disabled = false;

-- You can create more farmers by copying the above block and changing:
-- - 'farmer1' -> 'farmer2', 'farmer3', etc.
-- - Name and address as needed
-- Keep the same password_hash for "farmer123" or generate a new one

-- Example: Create farmer2
INSERT INTO users (username, role, name, address, password_hash, is_disabled)
VALUES (
    'farmer2',
    'farmer'::user_role,
    'Test Farmer 2',
    'EQFarmer2DummyAddress67890',
    '$argon2id$v=19$m=19456,t=2,p=1$RmFybWVyU2FsdDEyMzQ1Njc$VGVzdEhhc2hGb3JGYXJ1ZXIxMjM0NTY3ODkwMTIzNDU',
    false
)
ON CONFLICT (username)
DO NOTHING;

-- Display created farmers
SELECT
    username,
    role::text as role,
    name,
    address,
    is_disabled,
    created_at
FROM users
WHERE role = 'farmer'::user_role
ORDER BY created_at DESC;
