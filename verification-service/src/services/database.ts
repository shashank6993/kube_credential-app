import "dotenv/config";
import { Pool } from "pg";
import { Credential } from "../types/credential";
import logger from "../utils/logger";

export interface CredentialRecord {
  id: string;
  data: string;
  workerId: string;
  timestamp: string;
}

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

  public async getCredential(id: string): Promise<CredentialRecord | null> {
    const { rows } = await this.pool.query(
      'SELECT id, data, worker_id as "workerId", timestamp FROM credentials WHERE id = $1',
      [id]
    );
    return (rows[0] as CredentialRecord) || null;
  }

  public async verifyCredential(
    credential: Credential
  ): Promise<CredentialRecord | null> {
    const record = await this.getCredential(credential.id);
    if (!record) {
      return null;
    }
    const storedCredential = JSON.parse(record.data) as Credential;
    if (
      storedCredential.name === credential.name &&
      storedCredential.role === credential.role
    ) {
      return record;
    }
    return null;
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
