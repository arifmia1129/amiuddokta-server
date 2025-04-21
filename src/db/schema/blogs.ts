import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { seoFields } from "./seo";
import { users } from "../schema";

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sort_order: integer("sort_order").default(0),
  is_active: boolean("is_active").default(true),
  featured_image: text("featured_image"),
  description: text("description"),
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  featured_image: text("featured_image"),
  author_id: integer("author_id").references(() => users.id),
  category_id: integer("category_id").references(() => blogCategories.id),
  is_published: boolean("is_published").default(false),
  published_at: text("published_at"),
  ...seoFields,
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPostsTags = pgTable("blog_posts_tags", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id")
    .references(() => blogPosts.id)
    .notNull(),
  tag_id: integer("tag_id")
    .references(() => blogTags.id)
    .notNull(),
});
