ALTER TABLE "bdris_application_errors" DROP COLUMN IF EXISTS "raw_response";--> statement-breakpoint
ALTER TABLE "bdris_applications" DROP COLUMN IF EXISTS "print_link";--> statement-breakpoint
ALTER TABLE "bdris_applications" DROP COLUMN IF EXISTS "print_link_expiry";--> statement-breakpoint
ALTER TABLE "bdris_applications" DROP COLUMN IF EXISTS "status";