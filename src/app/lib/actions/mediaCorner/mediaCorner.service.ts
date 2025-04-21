"use server";

import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateMediaCornerInput,
  UpdateMediaCornerInput,
  MediaCornerFilterInput,
} from "./mediaCorner.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { mediaCorner } from "@/db/schema/mediaCorner";

export async function getMediaCornerItemsService(
  options: MediaCornerFilterInput,
) {
  const {
    page = 1,
    limit = 10,
    search,
    is_featured,
    sortBy = "created_at",
    sortOrder = "asc",
    type, // Include type in the options
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["title", "description"])
    : sql`1=1`;

  // Build featured condition
  const featuredCondition =
    is_featured !== undefined ? sql`is_featured = ${is_featured}` : sql`1=1`;

  // Build type condition
  const typeCondition = type ? sql`type = ${type}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, featuredCondition, typeCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(mediaCorner)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: mediaCorner.id,
    title: mediaCorner.title,
    description: mediaCorner.description,
    type: mediaCorner.type,
    created_at: mediaCorner.created_at,
    updated_at: mediaCorner.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    mediaCorner.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select()
    .from(mediaCorner)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single media corner item by ID
export async function getMediaCornerItemByIdService(id: number) {
  const result = await db
    .select()
    .from(mediaCorner)
    .where(eq(mediaCorner.id, id))
    .limit(1);
  return result[0] || null;
}

// Create new media corner item
export async function createMediaCornerItemService(
  input: CreateMediaCornerInput,
) {
  const result = await db
    .insert(mediaCorner)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing media corner item
export async function updateMediaCornerItemService(
  id: number,
  input: UpdateMediaCornerInput,
) {
  const result = await db
    .update(mediaCorner)
    .set(input as any)
    .where(eq(mediaCorner.id, id))
    .returning();
  return result[0] || null;
}

// Delete media corner item
export async function deleteMediaCornerItemService(id: number) {
  await db.delete(mediaCorner).where(eq(mediaCorner.id, id));
}
