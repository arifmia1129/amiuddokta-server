// src/app/lib/validations/clientFeedback.validation.ts
import { z } from "zod";

// Base feedback schema with common fields
const feedbackBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().optional(),
  company: z.string().optional(),
  profile_image: z.string().optional(),
  stars: z.number().int().min(1).max(5, "Stars must be between 1 and 5"),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  is_featured: z.boolean().default(false),
});

// Schema for creating a new feedback
export const createFeedbackSchema = feedbackBaseSchema.extend({
  stars: z.number().int().min(1).max(5, "Stars must be between 1 and 5"),
});

// Schema for updating an existing feedback
export const updateFeedbackSchema = feedbackBaseSchema.partial();

// Schema for filtering feedbacks
export const feedbackFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_featured: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type FeedbackFilterInput = z.infer<typeof feedbackFilterSchema>;
