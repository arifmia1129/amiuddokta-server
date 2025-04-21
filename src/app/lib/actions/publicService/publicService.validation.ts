// src/app/lib/validations/publicService.validation.ts
import { z } from "zod";

const publicServiceBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  short_description: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  external_link: z.string().optional(),
  has_modal: z.any().default(true),
  category: z.enum(["new_services", "notices", "important_links"]),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const createPublicServiceSchema = publicServiceBaseSchema.extend({
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

export const updatePublicServiceSchema = publicServiceBaseSchema.partial();

export const publicServiceFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  category: z.enum(["new_services", "notices", "important_links"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePublicServiceInput = z.infer<
  typeof createPublicServiceSchema
>;
export type UpdatePublicServiceInput = z.infer<
  typeof updatePublicServiceSchema
>;
export type PublicServiceFilterInput = z.infer<
  typeof publicServiceFilterSchema
>;
