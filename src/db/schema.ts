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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  contact: text("contact").unique().notNull(),
  about: text("about"),
  password: text("password").notNull(),
  role: text("role")
    .$type<"super_admin" | "admin" | "agent" | "sub_agent">()
    .notNull(),
  profile_image: text("profile_image"),
  parent_id: integer("parent_id"), // For agents and sub-agents
  balance: numeric("balance", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  payment_method: text("payment_method").notNull().unique(), // e.g., bkash, rocket, nagad
  account: text("account").notNull(), // Account identifier
  type: text("type").$type<"send_money" | "payment" | "other">().notNull(),
  details: text("details"), // Nullable, additional information
  logo: text("logo").notNull(), // URL or identifier for logo image
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rechargeRequests = pgTable("recharge_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id), // Linked to users
  type: integer("type") // Updated to reference payment_methods.id
    .notNull()
    .references(() => paymentMethods.id),
  from_account: text("from_account").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  transaction_id: text("transaction_id").notNull(),
  status: text("status")
    .$type<"pending" | "approved" | "rejected">()
    .default("pending"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const agentFees = pgTable("agent_fees", {
  id: serial("id").primaryKey(),
  agent_id: integer("agent_id")
    .notNull()
    .references(() => users.id), // Parent agent
  sub_agent_id: integer("sub_agent_id").references(() => users.id), // Optional for agents' direct fees
  application_type: text("application_type")
    .$type<
      | "78_VERIFY"
      | "NEW_BMET"
      | "BMET_UPDATE"
      | "PDO_REGISTRATION"
      | "ALL_CORRECTION"
      | "LD_TAX"
    >()
    .notNull(),
  fee_per_application: numeric("fee_per_application", {
    precision: 10,
    scale: 2,
  }).notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  module: text("module"),
  setting_fields: jsonb("setting_fields"),
  created_by: integer("created_by"),
  created_at: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

// Define the application types
export type ApplicationType =
  | "78_VERIFY"
  | "NEW_BMET"
  | "BMET_UPDATE"
  | "PDO_REGISTRATION"
  | "ALL_CORRECTION"
  | "LD_TAX";

// Base fields that all applications share
interface BaseApplicationFields {
  passportNo?: string;
  mobileNo?: string;
}

// Type-specific fields
interface VerifyFields extends BaseApplicationFields {
  type: "78_VERIFY";
}

interface NewBmetFields extends BaseApplicationFields {
  type: "NEW_BMET";
  fullName: string;
  passportIssueDate: string;
  passportExpireDate: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  district: string;
  upazila: string;
  union: string;
  nominiName: string;
  nominiFatherName: string;
  nominiMotherName: string;
  country: string;
  profession: string;
  passportCopy: string; // URL/path to image
}

interface BmetUpdateFields extends BaseApplicationFields {
  type: "BMET_UPDATE";
  country: string;
  profession: string;
  passportCopy: string;
}

interface PdoRegistrationFields extends BaseApplicationFields {
  type: "PDO_REGISTRATION";
  ttc: string;
  country: string;
  profileImage: string;
  passportCopy: string;
}

interface AllCorrectionFields extends BaseApplicationFields {
  type: "ALL_CORRECTION";
  // Add specific fields for correction
  correctionDetails: string;
}

interface LdTaxFields extends BaseApplicationFields {
  type: "LD_TAX";
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  jl: string;
  khatianNo: string;
  holdingNo: string;
}

// Union type of all possible application data structures
export type ApplicationData =
  | VerifyFields
  | NewBmetFields
  | BmetUpdateFields
  | PdoRegistrationFields
  | AllCorrectionFields
  | LdTaxFields;

// The actual schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),

  // Common fields that we want to query directly
  type: text("type").$type<ApplicationType>().notNull(),
  status: text("status")
    .$type<"pending" | "approved" | "rejected">()
    .default("pending"),
  fee_applied: numeric("fee_applied", { precision: 10, scale: 2 }).notNull(),

  // Store all type-specific data in a JSON field
  data: jsonb("data").$type<ApplicationData>().notNull(),

  // Metadata fields
  action_by: integer("action_by").references(() => users.id),
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
  // rawResponse: text("raw_response"), // HTML response that caused parsing issues

  // Resolution tracking
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
  resolution: text("resolution"), // How the error was resolved

  created_at: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});
