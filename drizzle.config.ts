import { defineConfig } from "drizzle-kit";
import { env } from "@/config/env";

export default defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
    ssl: false,
  },
  dialect: "postgresql",
  schema: "./src/db/schema/*",
  out: "./src/db/migrations/",
});
