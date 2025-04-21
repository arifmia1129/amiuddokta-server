CREATE TABLE IF NOT EXISTS "public_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"content" text NOT NULL,
	"external_link" text,
	"has_modal" boolean DEFAULT true,
	"category" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "public_services_slug_unique" UNIQUE("slug")
);
