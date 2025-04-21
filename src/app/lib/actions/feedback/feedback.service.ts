"use server";

// src/app/lib/actions/feedback/feedback.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateFeedbackInput,
  UpdateFeedbackInput,
  FeedbackFilterInput,
} from "./feedback.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { clientFeedback } from "@/db/schema/clientFeedback";

export async function getFeedbacksService(options: FeedbackFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_featured,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["name", "feedback"])
    : sql`1=1`;

  // Build status condition
  const featuredCondition =
    is_featured !== undefined ? sql`is_featured = ${is_featured}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, featuredCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientFeedback)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: clientFeedback.id,
    name: clientFeedback.name,
    created_at: clientFeedback.created_at,
    updated_at: clientFeedback.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    clientFeedback.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: clientFeedback.id,
      name: clientFeedback.name,
      designation: clientFeedback.designation,
      company: clientFeedback.company,
      profile_image: clientFeedback.profile_image,
      stars: clientFeedback.stars,
      feedback: clientFeedback.feedback,
      is_featured: clientFeedback.is_featured,
      created_at: clientFeedback.created_at,
      updated_at: clientFeedback.updated_at,
    })
    .from(clientFeedback)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single feedback by ID
export async function getFeedbackByIdService(id: number) {
  const result = await db
    .select()
    .from(clientFeedback)
    .where(eq(clientFeedback.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new feedback
export async function createFeedbackService(input: CreateFeedbackInput) {
  const result = await db
    .insert(clientFeedback)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing feedback
export async function updateFeedbackService(
  id: number,
  input: UpdateFeedbackInput,
) {
  const result = await db
    .update(clientFeedback)
    .set(input as any)
    .where(eq(clientFeedback.id, id))
    .returning();
  return result[0];
}

// Delete feedback
export async function deleteFeedbackService(id: number) {
  await db.delete(clientFeedback).where(eq(clientFeedback.id, id));
}
