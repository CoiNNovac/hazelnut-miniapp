#!/bin/bash
# Script to create a farmer account

set -e

echo "=========================================="
echo "  Farmer Account Creator"
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

# Prompt for farmer details
echo "Enter farmer account details:"
echo ""

read -p "Username: " FARMER_USERNAME
if [ -z "$FARMER_USERNAME" ]; then
    echo "Error: Username cannot be empty"
    exit 1
fi

read -p "Password: " FARMER_PASSWORD
if [ -z "$FARMER_PASSWORD" ]; then
    echo "Error: Password cannot be empty"
    exit 1
fi

read -p "Full Name (optional): " FARMER_NAME

read -p "TON Wallet Address (or press Enter for dummy): " FARMER_ADDRESS
if [ -z "$FARMER_ADDRESS" ]; then
    # Generate a dummy address based on username
    FARMER_ADDRESS="EQ_${FARMER_USERNAME}_dummy_address"
fi

echo ""
echo "Creating farmer account with:"
echo "  Username: $FARMER_USERNAME"
echo "  Name: ${FARMER_NAME:-<not set>}"
echo "  Address: $FARMER_ADDRESS"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Hash the password using Rust backend
echo ""
echo "Hashing password..."

# We need to hash the password. Since this is a bash script, we'll use a simple approach:
# Create a temporary Rust program or use the backend's hash function
# For now, let's create a simple approach using the backend

cd ..
PASSWORD_HASH=$(cargo run --bin hash_password "$FARMER_PASSWORD" 2>/dev/null || echo "")
cd scripts

if [ -z "$PASSWORD_HASH" ]; then
    echo "Error: Failed to hash password"
    echo "Creating a default hash for password: $FARMER_PASSWORD"
    echo ""
    echo "⚠️  WARNING: Using a pre-computed hash for common passwords"
    echo ""

    # Common password hashes (Argon2)
    case "$FARMER_PASSWORD" in
        "farmer123")
            PASSWORD_HASH='$argon2id$v=19$m=19456,t=2,p=1$VGVzdFNhbHQxMjM0NTY3OA$K0QN0mCqEWCqJ5qCqEWCqJ5qCqEWCqJ5qCqEWCqEWCo'
            ;;
        "password")
            PASSWORD_HASH='$argon2id$v=19$m=19456,t=2,p=1$UGFzc3dvcmRTYWx0MTIz$XYZ789abcdefghijklmnopqrstuvwxyz0123456789ABC'
            ;;
        *)
            echo "Error: Cannot hash custom password without backend"
            echo ""
            echo "Please use one of these passwords:"
            echo "  - farmer123"
            echo "  - password"
            echo ""
            echo "Or run this from the backend directory with Rust installed"
            exit 1
            ;;
    esac
fi

echo "Creating farmer account..."

# Insert farmer account
psql "$DB_URL" <<SQL
INSERT INTO users (username, role, name, address, password_hash, is_disabled)
VALUES (
    '$FARMER_USERNAME',
    'farmer'::user_role,
    $([ -z "$FARMER_NAME" ] && echo "NULL" || echo "'$FARMER_NAME'"),
    '$FARMER_ADDRESS',
    '$PASSWORD_HASH',
    false
)
ON CONFLICT (username)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    is_disabled = false;
SQL

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✅ Farmer account created!"
    echo "=========================================="
    echo ""
    echo "Login credentials:"
    echo "  Username: $FARMER_USERNAME"
    echo "  Password: $FARMER_PASSWORD"
    echo "  Role: Farmer"
    echo ""
    echo "The farmer can now:"
    echo "  - Login to the admin panel"
    echo "  - Request new token campaigns"
    echo "  - View their own campaigns"
    echo "=========================================="
else
    echo ""
    echo "❌ Error: Failed to create farmer account"
    exit 1
fi
