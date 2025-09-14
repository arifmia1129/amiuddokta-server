import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const bdrisApplications = pgTable("bdris_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Application details
  applicationId: text("application_id").notNull(), // BDRIS application ID (e.g., "253754631")
  applicationType: text("application_type")
    .$type<
      | "birth_registration"
      | "birth_correction"
      | "death_registration"
      | "death_correction"
    >()
    .notNull(),

  // Application submission tracking - we are third party, no status management needed

  // Additional info extracted from response
  additionalInfo: jsonb("additional_info").$type<{
    applicationType?: string; // Bengali application type
    officeName?: string; // Assigned office name and address
    phoneNumber?: string; // Registered phone number
    submissionDeadline?: string; // Deadline for document submission
    officeAddress?: string;
    assignedOffice?: string;
    documentSubmissionRequired?: boolean;
  }>(),

  // Form data used for application (for resubmission if needed)
  formData: jsonb("form_data"),

  // Response metadata
  rawHtmlResponse: text("raw_html_response"), // Store original HTML response for debugging
  responseExtracted: boolean("response_extracted").default(true), // Whether parsing was successful

  // Timestamps
  submittedAt: timestamp("submitted_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  lastChecked: timestamp("last_checked", { mode: "date", withTimezone: true }),

  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Table for tracking application errors and failed submissions
export const bdrisApplicationErrors = pgTable("bdris_application_errors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Error details
  errorType: text("error_type")
    .$type<
      | "submission_failed"
      | "validation_error"
      | "server_error"
      | "parsing_error"
    >()
    .notNull(),
  errorMessage: text("error_message").notNull(),

  // Context
  applicationType: text("application_type")
    .$type<
      | "birth_registration"
      | "birth_correction"
      | "death_registration"
      | "death_correction"
    >()
    .notNull(),

  // Form data that caused the error (for debugging)
  formData: jsonb("form_data"),
  rawResponse: text("raw_response"), // HTML response that caused parsing issues

  // Resolution tracking
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
  resolution: text("resolution"), // How the error was resolved

  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BdrisApplication = typeof bdrisApplications.$inferSelect;
export type BdrisApplicationInsert = typeof bdrisApplications.$inferInsert;
export type BdrisApplicationError = typeof bdrisApplicationErrors.$inferSelect;
export type BdrisApplicationErrorInsert =
  typeof bdrisApplicationErrors.$inferInsert;
