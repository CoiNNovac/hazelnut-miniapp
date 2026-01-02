#!/bin/bash
# Script to reset SQLx migrations tracking

set -e  # Exit on any error

# Get the database URL
if [ -f .env ]; then
    DB_URL=$(grep DATABASE_URL .env | cut -d= -f2)
else
    echo "No .env file found. Please enter your database URL:"
    read DB_URL
fi

if [ -z "$DB_URL" ]; then
    echo "Error: DATABASE_URL is not set"
    exit 1
fi

echo "Using database: $DB_URL"
echo "WARNING: This will reset all migration tracking. Migrations will need to be re-applied."
echo "Are you sure you want to continue? (y/N)"
read confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Dropping _sqlx_migrations table..."
psql $DB_URL -c "DROP TABLE IF EXISTS _sqlx_migrations;"

echo "SQLx migration tracking has been reset."
echo "You can now run your migrations again using ./run_migrations.sh"