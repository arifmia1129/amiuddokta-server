// src/db/schema/public_services.ts
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const public_services = pgTable("public_services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  short_description: text("short_description"),
  content: text("content").notNull(),
  external_link: text("external_link"),
  has_modal: boolean("has_modal").default(true),
  category: text("category")
    .$type<"new_services" | "notices" | "important_links">()
    .notNull(),
  status: text("status").$type<"active" | "inactive">().default("active"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
