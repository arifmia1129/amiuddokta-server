import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/config/env";

// Create postgres connection
const connectionString = env.DATABASE_URL;
const client = postgres(connectionString, { max: 10 });

// Create drizzle instance with all schema tables
export const db = drizzle(client, { schema });

// Utility function to check if the database connection is healthy
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
