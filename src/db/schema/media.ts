// src/db/schema/media.ts
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  file_name: text("file_name").notNull(),
  file_path: text("file_path").notNull(),
  file_type: text("file_type").notNull(),
  mime_type: text("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  alt_text: text("alt_text"),
  description: text("description"),
  user_id: integer("user_id").notNull(), // who uploaded the file
  status: text("status")
    .$type<"active" | "inactive" | "archived">()
    .default("active"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
