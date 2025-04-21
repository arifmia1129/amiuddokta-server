import constant from "@/constant";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

// Retrieve the connection string from environment variables
const connectionString = constant.databaseUrl;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("Database connection established");
});

pool.on("error", (err) => {
  console.log("Database connection error");
});

// Initialize Drizzle ORM with the PostgreSQL pool
export const db = drizzle(pool, { schema });
