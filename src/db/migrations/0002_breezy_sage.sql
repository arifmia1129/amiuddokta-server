CREATE TABLE IF NOT EXISTS "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ward_id" integer NOT NULL,
	"post_office_bn" text NOT NULL,
	"post_office_en" text NOT NULL,
	"village_bn" text NOT NULL,
	"village_en" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
