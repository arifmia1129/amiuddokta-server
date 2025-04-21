import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { careers } from "./careers";

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  job_id: integer("job_id")
    .notNull()
    .references(() => careers.id, { onDelete: "cascade" }),
  agent_id: integer("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Applicant information fields
  applicant_name: text("applicant_name").notNull(),
  applicant_email: text("applicant_email").notNull(),
  applicant_phone: text("applicant_phone").notNull(),
  applicant_address: text("applicant_address"),
  applicant_education: text("applicant_education"),
  applicant_experience: text("applicant_experience"),
  applicant_skills: text("applicant_skills"),
  applicant_nid: text("applicant_nid"), // National ID

  resume_url: text("resume_url").notNull(),
  cover_letter: text("cover_letter"),
  status: text("status")
    .$type<"pending" | "reviewed" | "shortlisted" | "rejected" | "hired">()
    .default("pending"),
  agent_notes: text("agent_notes"),
  application_date: timestamp("application_date", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
