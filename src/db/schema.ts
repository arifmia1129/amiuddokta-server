import {
  serial,
  text,
  timestamp,
  pgTable,
  jsonb,
  numeric,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// Define the Ward type for address management
type Ward = {
  id: number;
  nameEn: string;
  nameBn: string;
  geoLevelId: number;
  geoCode: string | null;
  parentGeoId: number;
  rmoCode: number;
  wardNumber: number | null;
  dateApplied: string | null;
  isActiveInAddress: boolean | null;
};

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
  union: integer("union").unique(),
  ward: jsonb("ward").$type<Ward>(),
  last_login: timestamp("last_login", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Address table for user location information
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  ward_id: integer("ward_id").notNull(),
  post_office_bn: text("post_office_bn").notNull(),
  post_office_en: text("post_office_en").notNull(),
  village_bn: text("village_bn").notNull(),
  village_en: text("village_en").notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

// BDRIS Applications table
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

  // Print and tracking info
  printLink: text("print_link"), // Full URL to print the application
  printLinkExpiry: timestamp("print_link_expiry", {
    mode: "date",
    withTimezone: true,
  }),

  // Application status and response info
  status: text("status")
    .$type<"submitted" | "under_review" | "approved" | "rejected" | "expired">()
    .notNull()
    .default("submitted"),

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
