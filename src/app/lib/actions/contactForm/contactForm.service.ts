"use server";

import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateContactFormInput,
  UpdateContactFormInput,
  ContactFormFilterInput,
} from "./contactForm.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { contactForm } from "@/db/schema/contactForm";

export async function getContactFormsService(options: ContactFormFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["name", "subject", "message"])
    : sql`1=1`;

  // Combine all conditions
  const whereCondition = searchCondition;

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactForm)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: contactForm.id,
    name: contactForm.name,
    created_at: contactForm.created_at,
    updated_at: contactForm.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    contactForm.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: contactForm.id,
      name: contactForm.name,
      email: contactForm.email,
      subject: contactForm.subject,
      message: contactForm.message,
      created_at: contactForm.created_at,
      updated_at: contactForm.updated_at,
    })
    .from(contactForm)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single contact form submission by ID
export async function getContactFormByIdService(id: number) {
  const result = await db
    .select()
    .from(contactForm)
    .where(eq(contactForm.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new contact form submission
export async function createContactFormService(input: CreateContactFormInput) {
  const result = await db
    .insert(contactForm)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing contact form submission
export async function updateContactFormService(
  id: number,
  input: UpdateContactFormInput,
) {
  const result = await db
    .update(contactForm)
    .set(input as any)
    .where(eq(contactForm.id, id))
    .returning();
  return result[0];
}

// Delete contact form submission
export async function deleteContactFormService(id: number) {
  await db.delete(contactForm).where(eq(contactForm.id, id));
}
