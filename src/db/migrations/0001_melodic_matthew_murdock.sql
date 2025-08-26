ALTER TABLE "bdris_application_errors" ADD COLUMN "raw_response" text;--> statement-breakpoint
ALTER TABLE "bdris_applications" ADD COLUMN "raw_html_response" text;