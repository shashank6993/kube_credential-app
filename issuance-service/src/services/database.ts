import "dotenv/config";
import { Pool } from "pg";
import { Credential } from "../types/credential";
import logger from "../utils/logger";

class DatabaseService {
  private pool: Pool;

  constructor(_unused?: string) {
    try {
      const connectionString =
        process.env.DATABASE_URL || buildConnectionStringFromParts();
      if (!connectionString || typeof connectionString !== "string") {
        throw new Error("DATABASE_URL is not set or invalid");
      }
      this.pool = new Pool({
        connectionString,
        ssl: connectionString?.includes("sslmode=require")
          ? { rejectUnauthorized: false }
          : undefined,
      });
      this.initialize();
      logger.info("PostgreSQL pool initialized");
    } catch (error) {
      logger.error("Failed to initialize PostgreSQL", { error });
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        worker_id TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `;
    await this.pool.query(createTableSQL);
  }

  public async credentialExists(id: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      "SELECT 1 FROM credentials WHERE id = $1",
      [id]
    );
    return rows.length > 0;
  }

  public async saveCredential(
    credential: Credential,
    workerId: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    try {
      await this.pool.query(
        "INSERT INTO credentials (id, data, worker_id, timestamp) VALUES ($1, $2, $3, $4)",
        [credential.id, JSON.stringify(credential), workerId, timestamp]
      );
      logger.info("Credential saved", { id: credential.id, workerId });
    } catch (error) {
      logger.error("Failed to save credential", { error, id: credential.id });
      throw error;
    }
  }

  public async getCredential(
    id: string
  ): Promise<{ data: string; workerId: string; timestamp: string } | null> {
    const { rows } = await this.pool.query(
      'SELECT data, worker_id as "workerId", timestamp FROM credentials WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info("PostgreSQL pool closed");
  }
}

export default DatabaseService;

function buildConnectionStringFromParts(): string | undefined {
  const host = process.env.PGHOST;
  const port = process.env.PGPORT || "5432";
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  if (host && database && user && typeof password === "string") {
    const ssl = process.env.PGSSLMODE || "require";
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
      password
    )}@${host}:${port}/${database}?sslmode=${ssl}`;
  }
  return undefined;
}
