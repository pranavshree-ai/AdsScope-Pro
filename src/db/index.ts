import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { logger } from "../lib/logger";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;

  try {
    if (connectionString && !connectionString.includes("localhost:5432")) {
      // If a non-default or active connection string is provided
      pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      dbInstance = drizzle(pool, { schema });
      return dbInstance;
    }
  } catch (err) {
    logger.warn({ err }, "Could not connect to PostgreSQL directly, falling back to local storage engine");
  }

  // Fallback / Standalone engine
  return null;
}

export { schema };
