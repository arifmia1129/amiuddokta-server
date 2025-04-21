import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Enum for job status
export const jobStatusEnum = pgEnum("job_status", [
  "open",
  "closed",
  "draft",
  "expired",
  "filled",
]);

// Enum for job type
export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
  "remote",
]);

export const careers = pgTable("careers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company_name: text("company_name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  qualifications: text("qualifications"),
  salary_range: text("salary_range"),
  benefits: text("benefits"),
  featured_image: text("featured_image"),
  job_status: jobStatusEnum("job_status").default("open"),
  job_type: jobTypeEnum("job_type").notNull(),
  experience_required: integer("experience_required"),
  education_level: text("education_level"),
  skills_required: text("skills_required"),
  application_deadline: text("application_deadline"),
  is_featured: boolean("is_featured").default(false),
  contact_email: text("contact_email").notNull(),
  contact_phone: text("contact_phone"),
  posted_by: integer("posted_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  views_count: integer("views_count").default(0),
  applications_count: integer("applications_count").default(0),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
