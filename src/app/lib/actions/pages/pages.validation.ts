// src/app/lib/validations/pages.validation.ts
import { z } from "zod";
import { seoSchema } from "../utils/seo.validation";

// Base page schema with common fields
const pageBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  layout: z.string().optional(),
  sections: z.any().optional(),
  is_published: z.boolean().default(false),
  ...seoSchema.shape,
});

// Schema for creating a new page
export const createPageSchema = pageBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Schema for updating an existing page
export const updatePageSchema = pageBaseSchema.partial();

// Schema for filtering pages
export const pageFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_published: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageFilterInput = z.infer<typeof pageFilterSchema>;
