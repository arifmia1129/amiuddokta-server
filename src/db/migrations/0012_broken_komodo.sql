DO $$ BEGIN
 CREATE TYPE "public"."job_status" AS ENUM('open', 'closed', 'draft', 'expired', 'filled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."job_type" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship', 'remote');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "careers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"responsibilities" text,
	"qualifications" text,
	"salary_range" text,
	"benefits" text,
	"job_status" "job_status" DEFAULT 'open',
	"job_type" "job_type" NOT NULL,
	"experience_required" integer,
	"education_level" text,
	"skills_required" text,
	"application_deadline" timestamp with time zone,
	"is_featured" boolean DEFAULT false,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"posted_by" integer NOT NULL,
	"views_count" integer DEFAULT 0,
	"applications_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"applicant_name" text NOT NULL,
	"applicant_email" text NOT NULL,
	"applicant_phone" text NOT NULL,
	"applicant_address" text,
	"applicant_education" text,
	"applicant_experience" text,
	"applicant_skills" text,
	"applicant_nid" text,
	"resume_url" text NOT NULL,
	"cover_letter" text,
	"status" text DEFAULT 'pending',
	"agent_notes" text,
	"application_date" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "careers" ADD CONSTRAINT "careers_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_careers_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
