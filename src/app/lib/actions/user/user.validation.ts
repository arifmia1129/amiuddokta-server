import { z } from "zod";

// Base user schema with common fields
const userBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(10, "Contact number must be at least 10 characters"),
  about: z.string().optional(),
  profile_image: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  nid: z.string().optional(), // New field for NID
  years_of_experience: z.number().optional(), // New field for years of experience
  center_name: z.string().optional(), // New field for center name
  center_address: z.string().optional(), // New field for center address
  reason_to_join: z.string().optional(), // New field for reason to join
});

// Schema for creating a new user
export const createUserSchema = userBaseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin", "client", "agent"]).default("client"),
});

// Schema for updating an existing user
export const updateUserSchema = userBaseSchema.partial().extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.enum(["super_admin", "admin", "client", "agent"]).optional(),
});

// Schema for login
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Schema for changing password
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for user filters (admin panel)
export const userFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role: z.enum(["super_admin", "admin", "client", "agent"]).optional(),
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Types for use in the application
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
