// src/app/lib/validations/media.validation.ts
import { z } from "zod";

// Base media schema with common fields
const mediaBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  alt_text: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

// Schema for creating a new media item (client-side)
export const createMediaSchema = mediaBaseSchema.extend({
  file: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(
          file.type,
        ),
      "File type must be .png, .jpg, .jpeg, or .gif",
    ),
});

// Schema for creating a new media item (server-side)
export const createMediaServerSchema = mediaBaseSchema.extend({
  file_name: z.string().min(1, "File name is required"),
  file_path: z.string().min(1, "File path is required"),
  file_type: z.string().min(1, "File type is required"),
  mime_type: z.string().min(1, "MIME type is required"),
  size: z.number().positive("Size must be positive"),
  user_id: z.number().positive("User ID is required"),
});

// Schema for updating an existing media item
export const updateMediaSchema = mediaBaseSchema.partial();

// Schema for media filters (admin panel)
export const mediaFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  file_type: z.string().optional(),
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  user_id: z.number().optional(),
});

// Types for use in the application
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type CreateMediaServerInput = z.infer<typeof createMediaServerSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type MediaFilterInput = z.infer<typeof mediaFilterSchema>;
