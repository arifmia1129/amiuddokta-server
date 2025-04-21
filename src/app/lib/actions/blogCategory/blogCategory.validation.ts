// src/app/lib/validations/blogCategory.validation.ts
import { z } from "zod";
import { seoSchema } from "../utils/seo.validation";

// Base blog category schema with common fields
const blogCategoryBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  featured_image: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  ...seoSchema.shape,
});

// Schema for creating a new blog category
export const createBlogCategorySchema = blogCategoryBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Schema for updating an existing blog category
export const updateBlogCategorySchema = blogCategoryBaseSchema.partial();

// Schema for filtering blog categories
export const blogCategoryFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
export type BlogCategoryFilterInput = z.infer<typeof blogCategoryFilterSchema>;
