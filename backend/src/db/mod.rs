use anyhow::Result;
use sqlx::{PgPool, postgres::PgPoolOptions};

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
    ) -> Result<uuid::Uuid> {
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
}
