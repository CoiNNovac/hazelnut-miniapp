#!/bin/bash
# Script to create or reset admin account
# Default password: admin123

set -e

echo "=========================================="
echo "  Admin Account Creator/Resetter"
echo "=========================================="
echo ""

# Get database URL from .env
if [ -f ../.env ]; then
    DB_URL=$(grep DATABASE_URL ../.env | cut -d= -f2)
elif [ -f .env ]; then
    DB_URL=$(grep DATABASE_URL .env | cut -d= -f2)
else
    echo "Error: .env file not found"
    exit 1
fi

if [ -z "$DB_URL" ]; then
    echo "Error: DATABASE_URL not set in .env"
    exit 1
fi

# Default credentials
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="admin123"
# This is the Argon2 hash of "admin123"
DEFAULT_HASH='$argon2id$v=19$m=19456,t=2,p=1$Jzw4nzQP8wP2VtQTSWcIFg$aIWAI4XssKHjc4TMIdBIctIUMtW26FdiLrwJGKcK0OA'

echo "Default Admin Credentials:"
echo "  Username: $DEFAULT_USERNAME"
echo "  Password: $DEFAULT_PASSWORD"
echo ""
echo "This will create or reset the admin account."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Creating/Updating admin account..."

# Insert or update admin account
psql "$DB_URL" <<SQL
INSERT INTO users (username, role, name, address, password_hash, is_disabled)
VALUES (
    '$DEFAULT_USERNAME',
    'superadmin'::user_role,
    'Super Admin',
    '0x0000000000000000000000000000000000000000',
    '$DEFAULT_HASH',
    false
)
ON CONFLICT (username)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_disabled = false,
    role = 'superadmin'::user_role;
SQL

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ Admin account ready!"
    echo "=========================================="
    echo ""
    echo "Login credentials:"
    echo "  Username: $DEFAULT_USERNAME"
    echo "  Password: $DEFAULT_PASSWORD"
    echo ""
    echo "⚠️  IMPORTANT: Change this password after first login!"
    echo "=========================================="
else
    echo ""
    echo "❌ Error: Failed to create admin account"
    exit 1
fi
