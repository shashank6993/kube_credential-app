PostgreSQL setup for Kube Credential

1. Create table (run on your PostgreSQL database):

```sql
CREATE TABLE IF NOT EXISTS public.credentials (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
```

2. Connection string

- Use the `DATABASE_URL` environment variable, for example:
  `postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require`

3. Environment variables (optional parts-based config)

- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE`

Both services (`issuance-service`, `verification-service`) initialize this schema on startup if it does not exist.
