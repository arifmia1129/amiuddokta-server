import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { seoFields } from "./seo";

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  featured_image: text("featured_image"),
  layout: text("layout").default("default"),
  sections: jsonb("sections"), // Flexible content sections
  is_published: boolean("is_published").default(false),
  // SEO fields directly in the table
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
