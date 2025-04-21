import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  contact: text("contact").unique().notNull(),
  about: text("about"),
  password: text("password").notNull(),
  role: text("role")
    .$type<"super_admin" | "admin" | "client" | "agent">()
    .notNull(),
  profile_image: text("profile_image"),
  status: text("status")
    .$type<"active" | "inactive" | "suspended">()
    .default("active"),
  nid: text("nid"), // New field for NID
  years_of_experience: integer("years_of_experience"), // New field for years of experience
  center_name: text("center_name"), // New field for center name
  center_address: text("center_address"), // New field for center address
  reason_to_join: text("reason_to_join"), // New field for reason to join
  last_login: timestamp("last_login", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
