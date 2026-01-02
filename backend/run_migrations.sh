#!/bin/bash
# Script to run database migrations with state tracking using _sqlx_migrations table

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

# Create _sqlx_migrations table if it doesn't exist
echo "Checking migration tracking table..."
psql $DB_URL -c "
CREATE TABLE IF NOT EXISTS _sqlx_migrations (
    version BIGINT PRIMARY KEY,
    description TEXT NOT NULL,
    installed_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    checksum BYTEA NOT NULL,
    execution_time BIGINT NOT NULL
);"

# Get list of already applied migrations
APPLIED_MIGRATIONS=$(psql $DB_URL -t -c "SELECT description FROM _sqlx_migrations WHERE success = true ORDER BY version;")

# Get sorted list of migration files
MIGRATION_FILES=$(find migrations -name "*.sql" | sort)

# Count for statistics
TOTAL_MIGRATIONS=0
APPLIED=0
SKIPPED=0

echo "Checking migrations..."

# Process each migration file
for MIGRATION_FILE in $MIGRATION_FILES; do
    TOTAL_MIGRATIONS=$((TOTAL_MIGRATIONS + 1))
    FILENAME=$(basename "$MIGRATION_FILE")
    # Extract version and description from filename (format: VERSION_description.sql)
    VERSION=$(echo $FILENAME | cut -d'_' -f1)
    DESCRIPTION=${FILENAME#${VERSION}_}
    DESCRIPTION=${DESCRIPTION%.sql}
    
    # Check if migration has already been applied
    if echo "$APPLIED_MIGRATIONS" | grep -q "$DESCRIPTION"; then
        echo "Skipping already applied migration: $FILENAME"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo "Applying migration: $FILENAME"
    
    # Record start time
    START_TIME=$(date +%s%3N)  # Milliseconds
    
    # Run the migration
    psql $DB_URL -f "$MIGRATION_FILE"
    SUCCESS=$?
    
    # Calculate execution time
    END_TIME=$(date +%s%3N)
    EXECUTION_TIME=$((END_TIME - START_TIME))
    
    # Generate a simple checksum
    CHECKSUM=$(md5sum "$MIGRATION_FILE" | awk '{print $1}')
    
    # Record that we've applied this migration
    if [ $SUCCESS -eq 0 ]; then
        psql $DB_URL -c "INSERT INTO _sqlx_migrations (version, description, success, checksum, execution_time) 
                        VALUES ($VERSION, '$DESCRIPTION', true, decode('$CHECKSUM', 'hex'), $EXECUTION_TIME);"
        
        echo "Successfully applied: $FILENAME"
        APPLIED=$((APPLIED + 1))
    else
        psql $DB_URL -c "INSERT INTO _sqlx_migrations (version, description, success, checksum, execution_time) 
                        VALUES ($VERSION, '$DESCRIPTION', false, decode('$CHECKSUM', 'hex'), $EXECUTION_TIME);"
        
        echo "Failed to apply: $FILENAME"
        exit 1
    fi
done

# Print summary
echo "========== Migration Summary =========="
echo "Total migrations: $TOTAL_MIGRATIONS"
echo "Applied: $APPLIED"
echo "Skipped: $SKIPPED"
echo "======================================"

if [ $APPLIED -eq 0 ]; then
    echo "No new migrations to apply."
else
    echo "Migrations completed successfully!"
fi