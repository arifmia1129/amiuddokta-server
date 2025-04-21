"use server";

// src/app/lib/actions/pages/pages.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreatePageInput,
  UpdatePageInput,
  PageFilterInput,
} from "./pages.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { pages } from "@/db/schema/pages";

export async function getPagesService(options: PageFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_published,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["title", "content"])
    : sql`1=1`;

  // Build status condition
  const publishedCondition =
    is_published !== undefined ? sql`is_published = ${is_published}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, publishedCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(pages)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: pages.id,
    title: pages.title,
    created_at: pages.created_at,
    updated_at: pages.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] || pages.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      content: pages.content,
      featured_image: pages.featured_image,
      layout: pages.layout,
      sections: pages.sections,
      is_published: pages.is_published,
      created_at: pages.created_at,
      updated_at: pages.updated_at,
    })
    .from(pages)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single page by ID
export async function getPageByIdService(id: number) {
  const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  return result[0] || null;
}

// Create new page
export async function createPageService(input: CreatePageInput) {
  const result = await db
    .insert(pages)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing page
export async function updatePageService(id: number, input: UpdatePageInput) {
  const result = await db
    .update(pages)
    .set(input as any)
    .where(eq(pages.id, id))
    .returning();
  return result[0];
}

// Delete page
export async function deletePageService(id: number) {
  await db.delete(pages).where(eq(pages.id, id));
}
