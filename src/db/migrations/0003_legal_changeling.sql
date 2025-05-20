ALTER TABLE "users" ADD COLUMN "ward" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_union_unique" UNIQUE("union");