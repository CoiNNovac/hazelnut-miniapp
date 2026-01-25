#!/bin/bash
# Script to create or reset admin account for backend-ts (MongoDB)
# Default password: admin123

set -e

echo "=========================================="
echo "  Admin Account Creator/Resetter"
echo "  Backend-TS (MongoDB)"
echo "=========================================="
echo ""

# Get MongoDB URL from .env
if [ -f ../.env ]; then
    MONGO_URI=$(grep MONGODB_URI ../.env | cut -d= -f2)
elif [ -f .env ]; then
    MONGO_URI=$(grep MONGODB_URI .env | cut -d= -f2)
else
    echo "Error: .env file not found"
    exit 1
fi

if [ -z "$MONGO_URI" ]; then
    echo "Error: MONGODB_URI not set in .env"
    exit 1
fi

# Default credentials
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="admin123"
# This is the Argon2 hash of "admin123" 
# Generated with: argon2id, m=19456, t=2, p=1
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

# Generate a UUID for the user
USER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Use mongosh to insert/update admin user
mongosh "$MONGO_URI" --quiet --eval "
db.users.updateOne(
  { username: '$DEFAULT_USERNAME' },
  {
    \$set: {
      _id: '$USER_ID',
      username: '$DEFAULT_USERNAME',
      role: 'superadmin',
      name: 'Super Admin',
      address: '0x0000000000000000000000000000000000000000',
      passwordHash: '$DEFAULT_HASH',
      isDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  { upsert: true }
);
print('Admin user created/updated successfully');
"

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
