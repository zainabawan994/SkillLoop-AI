import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    // Railway/Neon provide DATABASE_URL (Vercel may prefix it, e.g. STORAGE_DATABASE_URL); else SQL_* vars.
    const url =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      Object.entries(process.env).find(([k, v]) => /(DATABASE|POSTGRES)_URL$/.test(k) && v)?.[1];
    if (!url && !process.env.SQL_HOST) console.error("No DATABASE_URL set: database calls will fail.");
    const connection = url
      ? { connectionString: url }
      : {
          host: process.env.SQL_HOST,
          port: Number(process.env.SQL_PORT) || 5432,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
        };
    global._postgresPool = new Pool({
      ...connection,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
