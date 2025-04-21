import { z } from "zod";

// Define a base schema for careers without refinement
const careersBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().optional(),
  qualifications: z.string().optional(),
  salary_range: z.string().optional(),
  benefits: z.string().optional(),
  featured_image: z.string().optional(), // New field added
  job_status: z
    .enum(["open", "closed", "draft", "expired", "filled"])
    .default("open"),
  job_type: z.enum([
    "full_time",
    "part_time",
    "contract",
    "freelance",
    "internship",
    "remote",
  ]),
  experience_required: z.number().int().positive().optional(),
  education_level: z.string().optional(),
  skills_required: z.string().optional(),
  application_deadline: z.string().optional(),
  is_featured: z.boolean().default(false),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().optional(),
  posted_by: z.number().int().positive(),
  views_count: z.number().int().nonnegative().default(0),
  applications_count: z.number().int().nonnegative().default(0),
});

// Define a refined schema for careers
const careersRefinedSchema = careersBaseSchema.refine(
  (data) => {
    if (data.application_deadline) {
      return new Date(data.application_deadline) > new Date();
    }
    return true;
  },
  {
    message: "Application deadline must be in the future",
    path: ["application_deadline"],
  },
);

// Schema for creating a new career item
export const createCareersSchema = careersRefinedSchema;

// Schema for updating an existing career item
export const updateCareersSchema = careersBaseSchema.partial().refine(
  (data) => {
    if (data.application_deadline) {
      return new Date(data.application_deadline) > new Date();
    }
    return true;
  },
  {
    message: "Application deadline must be in the future",
    path: ["application_deadline"],
  },
);

// Schema for filtering career items
export const careersFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  is_featured: z.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  job_type: z
    .enum([
      "full_time",
      "part_time",
      "contract",
      "freelance",
      "internship",
      "remote",
    ])
    .optional(),
  job_status: z
    .enum(["open", "closed", "draft", "expired", "filled"])
    .optional(),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateCareersInput = z.infer<typeof createCareersSchema>;
export type UpdateCareersInput = z.infer<typeof updateCareersSchema>;
export type CareersFilterInput = z.infer<typeof careersFilterSchema>;
