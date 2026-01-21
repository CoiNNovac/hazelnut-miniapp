#!/bin/bash
set -e

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please set it in .env or environment."
  exit 1
fi

echo "Connecting to database..."

# Function to check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install postgresql-client."
    exit 1
fi

echo "Applying migrations in order..."

# List files and apply them
# Using sort to ensure timestamp order
for f in $(ls migrations/*.sql | sort); do
  echo "Applying $f..."
  psql "$DATABASE_URL" -f "$f"
done

echo "Migrations applied successfully!"
