# Backend Admin Scripts

## 1. Create/Reset Admin Account

Creates or resets the superadmin account with default credentials.

### Usage

```bash
cd backend/scripts
./create_admin.sh
```

### Default Credentials

**Username**: `admin`
**Password**: `admin123`

⚠️ **Important**: Change this password after first login!

### What it does

- Creates a new superadmin account if it doesn't exist
- Resets the password to default if the account exists
- Re-enables the account if it was disabled
- Ensures the role is set to `superadmin`

---

## 2. Create Farmer Accounts

Two options available:

### Option A: SQL Script (Recommended - Simple & Fast)

```bash
cd backend

# Method 1: From .env
DB_URL=$(grep DATABASE_URL .env | cut -d= -f2)
psql "$DB_URL" -f scripts/create_farmer_simple.sql

# Method 2: Direct (if DATABASE_URL is in environment)
psql $DATABASE_URL -f scripts/create_farmer_simple.sql
```

**Creates**:
- `farmer1` / `farmer123`
- `farmer2` / `farmer123`

Edit `create_farmer_simple.sql` to add more farmers or change details.

### Option B: Interactive Script

```bash
cd backend/scripts
./create_farmer.sh
```

Prompts for username, password, name, and wallet address.

⚠️ **Note**: Password hashing requires specific pre-set passwords. Use SQL script for custom farmers.

---

## Quick Reference

### All Default Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| `admin` | `admin123` | superadmin | Full access, approve campaigns, manage users |
| `farmer1` | `farmer123` | farmer | Request campaigns, view own campaigns |
| `farmer2` | `farmer123` | farmer | Request campaigns, view own campaigns |

---

## Requirements

- PostgreSQL client (`psql`) installed
- `.env` file with valid `DATABASE_URL`
- Database migrations already applied

### First Time Setup

```bash
# 1. Run migrations
cd backend
./run_migrations.sh

# 2. Create admin account
cd scripts
./create_admin.sh

# 3. Create farmer accounts
cd ..
psql $DATABASE_URL -f scripts/create_farmer_simple.sql
```

---

## Troubleshooting

**Error: .env file not found**
- Make sure you're running from `backend/scripts/` directory
- Or ensure there's a `.env` file in `backend/` directory

**Error: DATABASE_URL not set**
- Check your `.env` file has `DATABASE_URL` configured
- Format: `postgres://user:password@host:port/database`

**Error: Failed to create admin account**
- Ensure database migrations have been run: `cd backend && ./run_migrations.sh`
- Check PostgreSQL is running and accessible
- Verify database permissions

**Error: role "user_role" does not exist**
- Run migrations first: `./run_migrations.sh`
- This creates the required enums and tables
