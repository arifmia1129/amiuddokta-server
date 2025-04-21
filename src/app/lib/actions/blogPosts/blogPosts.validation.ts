// src/app/lib/validations/blog.validation.ts
import { z } from "zod";
import { seoSchema } from "../utils/seo.validation";

// Base blog post schema with common fields
const blogPostBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  author_id: z.number().int(),
  category_id: z.number().int(),
  is_published: z.boolean().default(false),
  published_at: z.string().optional(),
  ...seoSchema.shape,
});

// Schema for creating a new blog post
export const createBlogPostSchema = blogPostBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Schema for updating an existing blog post
export const updateBlogPostSchema = blogPostBaseSchema.partial();

// Schema for filtering blog posts
export const blogPostFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  category_id: z.number().int().positive(),
  search: z.string().optional(),
  is_published: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogPostFilterInput = z.infer<typeof blogPostFilterSchema>;
