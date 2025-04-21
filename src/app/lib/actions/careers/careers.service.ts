"use server";

import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateCareersInput,
  UpdateCareersInput,
  CareersFilterInput,
} from "./careers.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { careers } from "@/db/schema/careers";

export async function getCareersItemsService(options: CareersFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_featured,
    sortBy = "created_at",
    sortOrder = "asc",
    job_type,
    job_status,
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["title", "description", "company_name"])
    : sql`1=1`;

  // Build featured condition
  const featuredCondition =
    is_featured !== undefined ? sql`is_featured = ${is_featured}` : sql`1=1`;

  // Build job type condition
  const jobTypeCondition = job_type ? sql`job_type = ${job_type}` : sql`1=1`;

  // Build job status condition
  const jobStatusCondition = job_status
    ? sql`job_status = ${job_status}`
    : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(
    searchCondition,
    featuredCondition,
    jobTypeCondition,
    jobStatusCondition,
  );

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(careers)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: careers.id,
    title: careers.title,
    company_name: careers.company_name,
    location: careers.location,
    job_type: careers.job_type,
    job_status: careers.job_status,
    created_at: careers.created_at,
    updated_at: careers.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    careers.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select()
    .from(careers)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single career item by ID
export async function getCareersItemByIdService(id: number) {
  const result = await db
    .select()
    .from(careers)
    .where(eq(careers.id, id))
    .limit(1);
  return result[0] || null;
}

// Create new career item
export async function createCareersItemService(input: CreateCareersInput) {
  const result = await db
    .insert(careers)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing career item
export async function updateCareersItemService(
  id: number,
  input: UpdateCareersInput,
) {
  const result = await db
    .update(careers)
    .set(input as any)
    .where(eq(careers.id, id))
    .returning();
  return result[0] || null;
}

// Delete career item
export async function deleteCareersItemService(id: number) {
  await db.delete(careers).where(eq(careers.id, id));
}
