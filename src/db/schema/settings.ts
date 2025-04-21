import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "../schema";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  module: text("module").notNull(),
  setting_fields: jsonb("setting_fields").notNull(),
  created_by: integer("created_by").references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
