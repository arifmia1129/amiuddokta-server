// src/app/lib/validations/serviceCategory.validation.ts
import { z } from "zod";
import { seoSchema } from "../utils/seo.validation";

// Base service category schema with common fields
const serviceCategoryBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  ...seoSchema.shape,
});

// Schema for creating a new service category
export const createServiceCategorySchema = serviceCategoryBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Schema for updating an existing service category
export const updateServiceCategorySchema = serviceCategoryBaseSchema.partial();

// Schema for filtering service categories
export const serviceCategoryFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateServiceCategoryInput = z.infer<
  typeof createServiceCategorySchema
>;
export type UpdateServiceCategoryInput = z.infer<
  typeof updateServiceCategorySchema
>;
export type ServiceCategoryFilterInput = z.infer<
  typeof serviceCategoryFilterSchema
>;
