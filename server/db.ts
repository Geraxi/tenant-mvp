import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "DATABASE_URL is not set. Database-backed routes will fail until it's configured.",
  );
}

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : (null as any);

export const db = databaseUrl
  ? drizzle(pool, { schema })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "DATABASE_URL is not set. Database-backed routes are unavailable.",
          );
        },
      },
    ) as any);
