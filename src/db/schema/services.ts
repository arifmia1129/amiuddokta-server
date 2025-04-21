import {
  pgTable,
  serial,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { seoFields } from "./seo";

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  sort_order: integer("sort_order").default(0),
  is_active: boolean("is_active").default(true),
  // SEO fields directly in the table
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id").references(() => serviceCategories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  short_description: text("short_description"),
  description: text("description"),
  icon: text("icon"),
  featured_image: text("featured_image"),
  price: numeric("price", { precision: 10, scale: 2 }),
  is_featured: boolean("is_featured").default(false),
  is_active: boolean("is_active").default(true),
  sort_order: integer("sort_order").default(0), 
  // SEO fields directly in the table
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
