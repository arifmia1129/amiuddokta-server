// src/app/lib/validations/service.validation.ts
import { z } from "zod";
import { seoSchema } from "../utils/seo.validation";

// Base service schema with common fields
const serviceBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category_id: z
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  featured_image: z.string().optional(),
  price: z.number().min(0, "Price must be a non-negative number").optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  ...seoSchema.shape,
});

// Schema for creating a new service
export const createServiceSchema = serviceBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Schema for updating an existing service
export const updateServiceSchema = serviceBaseSchema.partial();

// Schema for filtering services
export const serviceFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceFilterInput = z.infer<typeof serviceFilterSchema>;
