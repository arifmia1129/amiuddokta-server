import { z } from "zod";

// Base address schema with common fields
const addressBaseSchema = z.object({
  user_id: z.number().int().positive(),
  ward_id: z.number().int().positive(),
  post_office_bn: z.string().min(1, "Post office name in Bengali is required"),
  post_office_en: z.string().min(1, "Post office name in English is required"),
  village_bn: z.string().min(1, "Village name in Bengali is required"),
  village_en: z.string().min(1, "Village name in English is required"),
});

// Schema for creating a new address
export const createAddressSchema = addressBaseSchema.extend({
  id: z.number().int().positive().optional(),
});

// Schema for updating an existing address
export const updateAddressSchema = addressBaseSchema.partial();

// Schema for address filters (admin panel)
export const addressFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  ward_id: z.number().int().positive().optional(),
  user_id: z.number().int().positive().optional(),
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Types for use in the application
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressFilterInput = z.infer<typeof addressFilterSchema>;
