CREATE TABLE IF NOT EXISTS "client_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designation" text,
	"company" text,
	"profile_image" text,
	"stars" integer NOT NULL,
	"feedback" text NOT NULL,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
