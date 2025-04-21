import { z } from "zod";

// Base contact form schema with common fields
const contactFormBaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Schema for creating a new contact form submission
export const createContactFormSchema = contactFormBaseSchema;

// Schema for updating an existing contact form submission
export const updateContactFormSchema = contactFormBaseSchema.partial();

// Schema for filtering contact form submissions
export const contactFormFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Export the inferred types for the create, update, and filter inputs
export type CreateContactFormInput = z.infer<typeof createContactFormSchema>;
export type UpdateContactFormInput = z.infer<typeof updateContactFormSchema>;
export type ContactFormFilterInput = z.infer<typeof contactFormFilterSchema>;
