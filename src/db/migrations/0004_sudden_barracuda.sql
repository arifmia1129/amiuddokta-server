CREATE TABLE IF NOT EXISTS "bdris_application_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"error_type" text NOT NULL,
	"error_message" text NOT NULL,
	"application_type" text NOT NULL,
	"form_data" jsonb,
	"raw_response" text,
	"is_resolved" boolean DEFAULT false,
	"resolved_at" timestamp with time zone,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bdris_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"application_id" text NOT NULL,
	"application_type" text NOT NULL,
	"print_link" text,
	"print_link_expiry" timestamp with time zone,
	"status" text DEFAULT 'submitted' NOT NULL,
	"additional_info" jsonb,
	"form_data" jsonb,
	"raw_html_response" text,
	"response_extracted" boolean DEFAULT true,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_checked" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bdris_application_errors" ADD CONSTRAINT "bdris_application_errors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bdris_applications" ADD CONSTRAINT "bdris_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
