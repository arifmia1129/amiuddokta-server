import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from ".";

(async () => {
  try {
    await migrate(db as any, { migrationsFolder: "./migrations" });
  } catch (error) {
    console.error("Migration error:", error);
  }
})();
