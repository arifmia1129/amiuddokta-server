"use server";

// src/app/lib/actions/publicService/publicService.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { public_services } from "@/db/schema/public_services";
import {
  CreatePublicServiceInput,
  UpdatePublicServiceInput,
  PublicServiceFilterInput,
} from "./publicService.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";

export async function getPublicServicesService(
  options: PublicServiceFilterInput,
) {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  const searchCondition = search
    ? createSearchCondition(search, ["title", "short_description", "content"])
    : sql`1=1`;

  const categoryCondition = category ? sql`category = ${category}` : sql`1=1`;
  const statusCondition = status ? sql`status = ${status}` : sql`1=1`;

  const whereCondition = and(
    searchCondition,
    categoryCondition,
    statusCondition,
  );

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(public_services)
    .where(whereCondition);

  const total = countResult[0].count;

  const offset = (page - 1) * limit;

  const sortableColumns = {
    id: public_services.id,
    title: public_services.title,
    category: public_services.category,
    status: public_services.status,
    created_at: public_services.created_at,
    updated_at: public_services.updated_at,
  };

  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    public_services.created_at;

  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: public_services.id,
      title: public_services.title,
      slug: public_services.slug,
      short_description: public_services.short_description,
      content: public_services.content,
      external_link: public_services.external_link,
      has_modal: public_services.has_modal,
      category: public_services.category,
      status: public_services.status,
      created_at: public_services.created_at,
      updated_at: public_services.updated_at,
    })
    .from(public_services)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

export async function getPublicServiceByIdService(id: number) {
  const result = await db
    .select()
    .from(public_services)
    .where(eq(public_services.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createPublicServiceService(
  input: CreatePublicServiceInput,
) {
  const result = await db.insert(public_services).values(input).returning();
  return result[0];
}

export async function updatePublicServiceService(
  id: number,
  input: UpdatePublicServiceInput,
) {
  const result = await db
    .update(public_services)
    .set(input)
    .where(eq(public_services.id, id))
    .returning();
  return result[0];
}

export async function deletePublicServiceService(id: number) {
  await db.delete(public_services).where(eq(public_services.id, id));
}
