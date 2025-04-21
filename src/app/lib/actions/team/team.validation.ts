import { z } from "zod";

// Define a schema for social links
const socialLinksSchema = z
  .object({
    linkedin: z.string().url("Invalid LinkedIn URL").optional(),
    twitter: z.string().url("Invalid Twitter URL").optional(),
    github: z.string().url("Invalid GitHub URL").optional(),
    website: z.string().url("Invalid website URL").optional(),
    instagram: z.string().url("Invalid Instagram URL").optional(),
  })
  .optional();

// Base team member schema with common fields
const teamBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  bio: z.string().optional(),
  profile_image: z.string().optional(),
  order: z.number().int().nonnegative().optional().default(0),
  social_links: socialLinksSchema,
  is_featured: z.boolean().default(false),
});

// Schema for creating a new team member
export const createTeamSchema = teamBaseSchema;

// Schema for updating an existing team member
export const updateTeamSchema = teamBaseSchema.partial();

// Schema for filtering team members
export const teamFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_featured: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type TeamFilterInput = z.infer<typeof teamFilterSchema>;
