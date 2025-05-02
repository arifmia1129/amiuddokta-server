import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  ward_id: integer("ward_id").notNull(),
  post_office_bn: text("post_office_bn").notNull(),
  post_office_en: text("post_office_en").notNull(),
  village_bn: text("village_bn").notNull(),
  village_en: text("village_en").notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
