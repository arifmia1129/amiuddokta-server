// src/db/schema/seo.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// Reusable SEO fields as a mixin
export const seoFields = {
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  og_title: text("og_title"),
  og_description: text("og_description"),
  og_image: text("og_image"),
  canonical_url: text("canonical_url"),
  schema_markup: jsonb("schema_markup"),
  index_status: text("index_status")
    .$type<"index" | "noindex">()
    .default("index"),
  sitemap_priority: text("sitemap_priority").default("0.5"),
};

// To allow attaching SEO to different content types
export const seoData = pgTable("seo_data", {
  id: serial("id").primaryKey(),
  entity_type: text("entity_type").notNull(), // page, service, blog, etc.
  entity_id: integer("entity_id").notNull(),
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
