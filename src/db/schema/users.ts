import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").unique().notNull(),
  about: text("about"),
  pin: text("pin").notNull(),
  role: text("role")
    .$type<"super_admin" | "admin" | "entrepreneur">()
    .notNull(),
  profile_image: text("profile_image"),
  status: text("status")
    .$type<"active" | "inactive" | "suspended">()
    .default("active"),
  center_name: text("center_name"),
  center_address: text("center_address"),
  division: integer("division"),
  district: integer("district"),
  upazila: integer("upazila"),
  union: integer("union"),
  last_login: timestamp("last_login", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
