import { z } from "zod";

// Reusable SEO validation schema
export const seoSchema = z.object({
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  canonical_url: z.string().optional(),
  schema_markup: z.string().optional(),
  index_status: z.enum(["index", "noindex"]).default("index"),
  sitemap_priority: z.string().default("0.5"),
});
