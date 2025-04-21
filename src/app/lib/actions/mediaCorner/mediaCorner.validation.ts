import { z } from "zod";

// Define a base schema for media corner without refinement
const mediaCornerBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["image", "video"]),
  link: z.string(),
  thumbnail: z.string().optional(),
  is_featured: z.boolean().default(false),
});

// Define a refined schema for media corner
const mediaCornerRefinedSchema = mediaCornerBaseSchema.refine(
  (data) => {
    if (data.type === "video") {
      return /^https:\/\/www\.youtube\.com\/embed\//.test(data.link);
    }
    return true;
  },
  {
    message: "Invalid YouTube iframe link for video type",
    path: ["link"],
  },
);

// Schema for creating a new media corner item
export const createMediaCornerSchema = mediaCornerRefinedSchema;

// Schema for updating an existing media corner item
export const updateMediaCornerSchema = mediaCornerBaseSchema.partial().refine(
  (data) => {
    if (data.type === "video" && data.link) {
      return /^https:\/\/www\.youtube\.com\/embed\//.test(data.link);
    }
    return true;
  },
  {
    message: "Invalid YouTube iframe link for video type",
    path: ["link"],
  },
);

// Schema for filtering media corner items
export const mediaCornerFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_featured: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  type: z.string().optional(),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateMediaCornerInput = z.infer<typeof createMediaCornerSchema>;
export type UpdateMediaCornerInput = z.infer<typeof updateMediaCornerSchema>;
export type MediaCornerFilterInput = z.infer<typeof mediaCornerFilterSchema>;
