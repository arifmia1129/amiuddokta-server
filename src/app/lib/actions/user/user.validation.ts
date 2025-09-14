import { z } from "zod";

// Create user validation schema
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  pin: z.string().min(4, "PIN must be at least 4 characters").max(20, "PIN must not exceed 20 characters"),
  role: z.enum(["super_admin", "admin", "entrepreneur"]).default("entrepreneur"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  center_name: z.string().max(200, "Center name must not exceed 200 characters").optional(),
  center_address: z.string().max(500, "Center address must not exceed 500 characters").optional(),
  division: z.number().int().positive().optional(),
  district: z.number().int().positive().optional(),
  upazila: z.number().int().positive().optional(),
  union: z.number().int().positive().optional(),
  ward: z.union([z.string(), z.number()]).optional(),
});

// Update user validation schema
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional(),
  pin: z.string().min(4, "PIN must be at least 4 characters").max(20, "PIN must not exceed 20 characters").optional(),
  profile_image: z.string().url("Profile image must be a valid URL").optional(),
  role: z.enum(["super_admin", "admin", "entrepreneur"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  center_name: z.string().max(200, "Center name must not exceed 200 characters").optional(),
  center_address: z.string().max(500, "Center address must not exceed 500 characters").optional(),
  division: z.number().int().positive().optional(),
  district: z.number().int().positive().optional(),
  upazila: z.number().int().positive().optional(),
  union: z.number().int().positive().optional(),
  ward: z.union([z.string(), z.number()]).optional(),
});

// Login validation schema
export const loginUserSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  pin: z.string().min(4, "PIN must be at least 4 characters"),
});

// User filter validation schema (for search/list operations)
export const userFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role: z.enum(["super_admin", "admin", "entrepreneur"]).optional(),
  sortBy: z.enum(["id", "name", "phone", "role", "status", "created_at", "updated_at", "last_login"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Change PIN validation schema
export const changePinSchema = z.object({
  currentPin: z.string().min(4, "Current PIN must be at least 4 characters"),
  newPin: z.string().min(4, "New PIN must be at least 4 characters").max(20, "New PIN must not exceed 20 characters"),
});

// TypeScript types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;