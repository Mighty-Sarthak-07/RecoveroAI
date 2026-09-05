import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/recovero";

// Global singleton caching to avoid connection pool exhaustion across Next.js reloads
declare global {
  // eslint-disable-next-line no-var
  var __postgres_client: postgres.Sql | undefined;
}

const client =
  global.__postgres_client ??
  postgres(connectionString, {
    prepare: false, // Required for Neon PgBouncer transaction pooling
    ssl: connectionString.includes("neon.tech") || connectionString.includes("sslmode=require") ? "require" : undefined,
    max: process.env.NODE_ENV === "production" ? 20 : 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__postgres_client = client;
}

export const db = drizzle(client, { schema });
export * from "./schema";
