use anyhow::Result;
use sqlx::{PgPool, postgres::PgPoolOptions};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use bigdecimal::BigDecimal;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: Option<String>,
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,
    pub address: String,
    pub role: String, // 'superadmin', 'admin', 'farmer'
    pub name: Option<String>,
    pub is_disabled: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Campaign {
    pub id: Uuid,
    pub farmer_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub token_name: String,
    pub token_symbol: String,
    pub token_supply: String,
    pub logo_url: Option<String>,
    pub image_url: Option<String>,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub suggested_price: BigDecimal,
    pub status: String, // 'pending', 'running', 'paused', 'finished', 'rejected', 'cancelled', 'approved'
    pub token_address: Option<String>, // TON blockchain address of minted token
    pub created_at: Option<DateTime<Utc>>,
    pub minted_at: Option<DateTime<Utc>>,
    pub mint_amount: Option<BigDecimal>,
    #[serde(rename = "tx_hash")]
    pub mint_tx_hash: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Purchase {
    pub id: Uuid,
    pub user_address: String,
    pub campaign_id: Uuid,
    pub mkoin_paid: BigDecimal,
    pub tokens_received: BigDecimal,
    pub tx_hash: Option<String>,
    pub status: String,
    pub purchased_at: DateTime<Utc>,
    pub confirmed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CampaignStats {
    pub total_purchases: i32,
    pub total_mkoin_raised: String,
    pub total_tokens_sold: String,
    pub unique_buyers: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct MkoinMint {
    pub id: Uuid,
    pub recipient_address: String,
    pub amount: BigDecimal,
    pub tx_hash: Option<String>,
    pub minted_by: Option<Uuid>,
    pub status: String,
    pub minted_at: DateTime<Utc>,
    pub confirmed_at: Option<DateTime<Utc>>,
}

#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        Ok(Self { pool })
    }

    pub async fn upsert_portfolio(
        &self,
        user_address: &str,
        token_address: &str,
        balance: &str, // passing as string to preserve precision for NUMERIC
        lt: i64,
    ) -> Result<()> {
        // Using unchecked query to allow compilation without pre-existing DB schema
        sqlx::query(
            r#"
            INSERT INTO portfolios (user_address, token_address, balance, last_updated_lt, updated_at)
            VALUES ($1, $2, $3::numeric, $4, NOW())
            ON CONFLICT (user_address, token_address) 
            DO UPDATE SET 
                balance = EXCLUDED.balance,
                last_updated_lt = EXCLUDED.last_updated_lt,
                updated_at = NOW()
            WHERE portfolios.last_updated_lt < EXCLUDED.last_updated_lt
            "#
        )
        .bind(user_address)
        .bind(token_address)
        .bind(balance)
        .bind(lt)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
    // --- User Management ---

    pub async fn create_user(
        &self,
        address: &str,
        role: &str,
        name: Option<&str>,
    ) -> Result<Uuid> {
        // "role" must be cast to user_role enum type in Postgres
        let rec = sqlx::query!(
            r#"
            INSERT INTO users (address, role, name)
            VALUES ($1, $2::user_role, $3)
            RETURNING id
            "#,
            address,
            role as _, // sqlx sometimes needs help casting string to enum
            name
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(rec.id)
    }

    pub async fn create_user_full(
        &self,
        username: &str,
        password_hash: &str,
        role: &str,
        address: &str, // Optional or generated if not provided? Schema says NOT NULL. 
                       // For admin, we used a dummy address in seed.
        name: Option<&str>,
    ) -> Result<Uuid> {
        let rec = sqlx::query!(
            r#"
            INSERT INTO users (username, password_hash, role, address, name)
            VALUES ($1, $2, $3::user_role, $4, $5)
            RETURNING id
            "#,
            username,
            password_hash,
            role as _,
            address,
            name
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(rec.id)
    }

    pub async fn get_user_role(&self, address: &str) -> Result<Option<String>> {
        // Return role as string
        let rec = sqlx::query!(
            r#"
            SELECT role::text as "role!" FROM users WHERE address = $1
            "#,
            address
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(rec.map(|r| r.role))
    }

    pub async fn get_user_by_address(&self, address: &str) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, username, password_hash, address, role::text as "role!", 
                name, is_disabled, created_at
            FROM users 
            WHERE address = $1
            "#,
            address
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(user)
    }

    pub async fn get_user_by_username(&self, username: &str) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, username, password_hash, address, role::text as "role!", 
                name, is_disabled, created_at
            FROM users 
            WHERE username = $1
            "#,
            username
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(user)
    }
    
    pub async fn get_user_by_id(&self, id: Uuid) -> Result<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, username, password_hash, address, role::text as "role!", 
                name, is_disabled, created_at
            FROM users 
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(user)
    }

    pub async fn list_users(&self, role_filter: Option<String>) -> Result<Vec<User>> {
        let users = if let Some(role) = role_filter {
            sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, username, password_hash, address, role::text as "role!", 
                    name, is_disabled, created_at
                FROM users 
                WHERE role::text = $1
                ORDER BY created_at DESC
                "#,
                role
            )
            .fetch_all(&self.pool)
            .await?
        } else {
            sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, username, password_hash, address, role::text as "role!", 
                    name, is_disabled, created_at
                FROM users 
                ORDER BY created_at DESC
                "#
            )
            .fetch_all(&self.pool)
            .await?
        };
        Ok(users)
    }

    pub async fn set_user_disabled(&self, id: Uuid, disabled: bool) -> Result<()> {
        sqlx::query!(
            "UPDATE users SET is_disabled = $1 WHERE id = $2",
            disabled,
            id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete_user(&self, id: Uuid) -> Result<()> {
        sqlx::query!("DELETE FROM users WHERE id = $1", id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // --- Campaign Management ---

    pub async fn create_campaign(&self, campaign: &Campaign) -> Result<Uuid> {
        // Assumes campaign.id is generated by caller or DB default, but here we probably pass fields.
        // Let's adapt to pass fields or use the struct.
        // Status defaults to pending in DB, but we can enforce it.
        
        let rec = sqlx::query!(
            r#"
            INSERT INTO campaigns (
                farmer_id, name, description, token_name, token_symbol, 
                token_supply, logo_url, image_url, start_time, end_time, 
                suggested_price, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::campaign_status)
            RETURNING id
            "#,
            campaign.farmer_id,
            campaign.name,
            campaign.description,
            campaign.token_name,
            campaign.token_symbol,
            campaign.token_supply,
            campaign.logo_url,
            campaign.image_url,
            campaign.start_time,
            campaign.end_time,
            campaign.suggested_price,
            campaign.status as _
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(rec.id)
    }

    pub async fn list_campaigns(&self, status_filter: Option<String>, farmer_id_filter: Option<Uuid>) -> Result<Vec<Campaign>> {
        // Construct query dynamically or use a simpler approach since we have limited filters
        // Using a basic builder approach or just different queries if complexity grows.
        // For 2 optional filters, we can use 1 query with COALESCE or similar logic,
        // or just building the query string. SQLx allows `QueryBuilder`.
        // Or simplified: `WHERE (status = $1 OR $1 IS NULL) AND (farmer_id = $2 OR $2 IS NULL)`

        let campaigns = sqlx::query_as!(
            Campaign,
            r#"
            SELECT
                id, farmer_id, name, description, token_name, token_symbol,
                token_supply, logo_url, image_url, start_time, end_time,
                suggested_price, status::text as "status!", token_address, created_at,
                minted_at, mint_amount, mint_tx_hash
            FROM campaigns
            WHERE (status::text = $1 OR $1 IS NULL)
              AND (farmer_id = $2 OR $2 IS NULL)
            ORDER BY created_at DESC
            "#,
            status_filter,
            farmer_id_filter
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(campaigns)
    }

    pub async fn get_campaign(&self, id: Uuid) -> Result<Option<Campaign>> {
        let campaign = sqlx::query_as!(
            Campaign,
            r#"
            SELECT
                id, farmer_id, name, description, token_name, token_symbol,
                token_supply, logo_url, image_url, start_time, end_time,
                suggested_price, status::text as "status!", token_address, created_at,
                minted_at, mint_amount, mint_tx_hash
            FROM campaigns
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(campaign)
    }

    pub async fn update_campaign_status(&self, id: Uuid, status: &str) -> Result<()> {
        sqlx::query!(
            "UPDATE campaigns SET status = $1::campaign_status WHERE id = $2",
            status as _,
            id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn update_campaign_token_address(&self, id: Uuid, token_address: &str) -> Result<()> {
        sqlx::query!(
            "UPDATE campaigns SET token_address = $1 WHERE id = $2",
            token_address,
            id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    // --- Campaign Mint Tracking ---

    pub async fn record_campaign_mint(
        &self,
        campaign_id: Uuid,
        recipient: &str,
        amount: &str,
        tx_hash: Option<&str>,
    ) -> Result<Uuid> {
        use std::str::FromStr;
        let amount_bd = BigDecimal::from_str(amount)?;
        let rec = sqlx::query!(
            r#"
            INSERT INTO campaign_token_mints (campaign_id, recipient_address, amount, tx_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            "#,
            campaign_id,
            recipient,
            amount_bd,
            tx_hash
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(rec.id)
    }

    pub async fn update_campaign_mint_info(
        &self,
        campaign_id: Uuid,
        amount: &str,
        tx_hash: Option<&str>,
    ) -> Result<()> {
        use std::str::FromStr;
        let amount_bd = BigDecimal::from_str(amount)?;
        sqlx::query!(
            r#"
            UPDATE campaigns
            SET minted_at = NOW(),
                mint_amount = $2,
                mint_tx_hash = $3
            WHERE id = $1
            "#,
            campaign_id,
            amount_bd,
            tx_hash
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    // --- Purchase Tracking ---

    pub async fn create_purchase(
        &self,
        user_address: &str,
        campaign_id: Uuid,
        mkoin_paid: &str,
        tokens_received: &str,
        tx_hash: &str,
    ) -> Result<Uuid> {
        use std::str::FromStr;
        let mkoin_paid_bd = BigDecimal::from_str(mkoin_paid)?;
        let tokens_received_bd = BigDecimal::from_str(tokens_received)?;
        let rec = sqlx::query!(
            r#"
            INSERT INTO purchases (user_address, campaign_id, mkoin_paid, tokens_received, tx_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            "#,
            user_address,
            campaign_id,
            mkoin_paid_bd,
            tokens_received_bd,
            tx_hash
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(rec.id)
    }

    pub async fn get_user_purchases(&self, user_address: &str) -> Result<Vec<Purchase>> {
        let purchases = sqlx::query_as::<_, Purchase>(
            r#"
            SELECT
                id,
                user_address,
                campaign_id,
                mkoin_paid,
                tokens_received,
                tx_hash,
                status,
                purchased_at,
                confirmed_at
            FROM purchases
            WHERE user_address = $1
            ORDER BY purchased_at DESC
            "#
        )
        .bind(user_address)
        .fetch_all(&self.pool)
        .await?;
        Ok(purchases)
    }

    pub async fn get_campaign_purchases(&self, campaign_id: Uuid) -> Result<Vec<Purchase>> {
        let purchases = sqlx::query_as::<_, Purchase>(
            r#"
            SELECT
                id,
                user_address,
                campaign_id,
                mkoin_paid,
                tokens_received,
                tx_hash,
                status,
                purchased_at,
                confirmed_at
            FROM purchases
            WHERE campaign_id = $1
            ORDER BY purchased_at DESC
            "#
        )
        .bind(campaign_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(purchases)
    }

    pub async fn get_campaign_stats(&self, campaign_id: Uuid) -> Result<CampaignStats> {
        let stats = sqlx::query!(
            r#"
            SELECT
                COUNT(*)::int as "total_purchases!",
                COALESCE(SUM(mkoin_paid), 0) as "total_mkoin_raised!",
                COALESCE(SUM(tokens_received), 0) as "total_tokens_sold!",
                COUNT(DISTINCT user_address)::int as "unique_buyers!"
            FROM purchases
            WHERE campaign_id = $1 AND status = 'confirmed'
            "#,
            campaign_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(CampaignStats {
            total_purchases: stats.total_purchases,
            total_mkoin_raised: stats.total_mkoin_raised.to_string(),
            total_tokens_sold: stats.total_tokens_sold.to_string(),
            unique_buyers: stats.unique_buyers,
        })
    }

    pub async fn get_user_portfolio(&self, user_address: &str) -> Result<Vec<crate::api::PortfolioItem>> {
        let items = sqlx::query!(
            r#"
            SELECT
                p.token_address as "token_address!",
                COALESCE(tm.symbol, 'UNKNOWN') as "symbol!",
                p.balance as "balance!"
            FROM portfolios p
            LEFT JOIN token_minters tm ON p.token_address = tm.address
            WHERE p.user_address = $1 AND p.balance > 0
            ORDER BY p.updated_at DESC
            "#,
            user_address
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(items
            .into_iter()
            .map(|r| crate::api::PortfolioItem {
                token_address: r.token_address,
                symbol: r.symbol,
                balance: r.balance.to_string(),
                usd_value: None,
            })
            .collect())
    }

    // MKOIN Mint Operations

    /// Record a MKOIN mint transaction
    pub async fn record_mkoin_mint(
        &self,
        recipient_address: &str,
        amount: &BigDecimal,
        tx_hash: &str,
        minted_by: Option<Uuid>,
        status: &str,
    ) -> Result<Uuid> {
        let record = sqlx::query!(
            r#"
            INSERT INTO mkoin_mints (recipient_address, amount, tx_hash, minted_by, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            "#,
            recipient_address,
            amount,
            tx_hash,
            minted_by,
            status
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(record.id)
    }

    /// Get MKOIN mint history
    pub async fn get_mkoin_mints(&self, limit: Option<i64>) -> Result<Vec<MkoinMint>> {
        let limit_val = limit.unwrap_or(100);

        let mints = sqlx::query_as::<_, MkoinMint>(
            r#"
            SELECT id, recipient_address, amount, tx_hash, minted_by, status, minted_at, confirmed_at
            FROM mkoin_mints
            ORDER BY minted_at DESC
            LIMIT $1
            "#
        )
        .bind(limit_val)
        .fetch_all(&self.pool)
        .await?;

        Ok(mints)
    }
}
