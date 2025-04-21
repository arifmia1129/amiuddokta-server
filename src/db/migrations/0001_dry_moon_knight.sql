ALTER TABLE "blog_categories" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "blog_categories" ADD COLUMN "is_active" boolean DEFAULT true;