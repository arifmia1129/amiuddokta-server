import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const clientFeedback = pgTable("client_feedback", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation"),
  company: text("company"),
  profile_image: text("profile_image"),
  stars: integer("stars").notNull(),
  feedback: text("feedback").notNull(),
  is_featured: boolean("is_featured").default(false),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
