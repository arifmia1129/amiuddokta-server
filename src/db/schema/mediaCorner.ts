import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

export const mediaCorner = pgTable("media_corner", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 10 }).notNull(), // 'image' or 'video'
  link: text("link").notNull(),
  thumbnail: text("thumbnail"),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
