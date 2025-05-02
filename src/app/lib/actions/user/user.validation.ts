import { z } from "zod";

// Base user schema with common fields
const userBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .length(11, "Phone number must be exactly 11 characters")
    .refine((value) => /^01[3-9]\d{8}$/.test(value), {
      message: "Phone number must be a valid Bangladeshi number",
    }),
  about: z.string().optional(),
  profile_image: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  center_name: z.string().optional(),
  center_address: z.string().optional(),
  division: z.number().optional(),
  district: z.number().optional(),
  upazila: z.number().optional(),
  union: z.number().optional(),
});

// Schema for creating a new user
export const createUserSchema = userBaseSchema.extend({
  pin: z
    .string()
    .min(4, "PIN must be at least 4 digits")
    .max(5, "PIN must be at most 5 digits"),
  role: z
    .enum(["super_admin", "admin", "entrepreneur"])
    .default("entrepreneur"),
});

// Schema for updating an existing user
export const updateUserSchema = userBaseSchema.partial().extend({
  pin: z
    .string()
    .min(4, "PIN must be at least 4 digits")
    .max(5, "PIN must be at most 5 digits")
    .optional(),
  role: z.enum(["super_admin", "admin", "entrepreneur"]).optional(),
});

// Schema for login
export const loginUserSchema = z.object({
  identifier: z
    .string()
    .length(11, "Phone number must be exactly 11 characters")
    .refine((value) => /^01[3-9]\d{8}$/.test(value), {
      message: "Phone number must be a valid Bangladeshi number",
    }),
  pin: z
    .string()
    .min(4, "PIN must be at least 4 digits")
    .max(5, "PIN must be at most 5 digits"),
});

// Schema for changing PIN
export const changePinSchema = z
  .object({
    currentPin: z
      .string()
      .min(4, "Current PIN must be at least 4 digits")
      .max(5, "Current PIN must be at most 5 digits"),
    newPin: z
      .string()
      .min(4, "New PIN must be at least 4 digits")
      .max(5, "New PIN must be at most 5 digits"),
    confirmPin: z
      .string()
      .min(4, "Confirm PIN must be at least 4 digits")
      .max(5, "Confirm PIN must be at most 5 digits"),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

// Schema for user filters (admin panel)
export const userFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role: z.enum(["super_admin", "admin", "entrepreneur"]).optional(),
  sortBy: z.string().optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Types for use in the application
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
