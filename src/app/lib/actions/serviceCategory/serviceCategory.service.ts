"use server";

// src/app/lib/actions/serviceCategory/serviceCategory.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { serviceCategories, services } from "@/db/schema/services";
import {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
  ServiceCategoryFilterInput, // Import the type correctly
} from "./serviceCategory.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";

export async function getServiceCategoriesService(
  options: ServiceCategoryFilterInput,
) {
  const {
    page = 1,
    limit = 10,
    search,
    is_active,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["name", "description"])
    : sql`1=1`;

  // Build status condition
  const activeCondition =
    is_active !== undefined ? sql`is_active = ${is_active}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, activeCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceCategories)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: serviceCategories.id,
    name: serviceCategories.name,
    sort_order: serviceCategories.sort_order,
    is_active: serviceCategories.is_active,
    created_at: serviceCategories.created_at,
    updated_at: serviceCategories.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    serviceCategories.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      description: serviceCategories.description,
      icon: serviceCategories.icon,
      sort_order: serviceCategories.sort_order,
      is_active: serviceCategories.is_active,
      created_at: serviceCategories.created_at,
      updated_at: serviceCategories.updated_at,
    })
    .from(serviceCategories)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single service category by ID
export async function getServiceCategoryByIdService(id: number) {
  const result = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);

  return result[0] || null;
}
export async function getServiceCategoryBySlugService(slug: string) {
  // Fetch the category by slug
  const categoryResult = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.slug, slug))
    .limit(1);

  const category = categoryResult[0];

  if (!category) {
    return null;
  }

  // Fetch the associated services
  const servicesResult = await db
    .select()
    .from(services)
    .where(eq(services.category_id, category.id));

  return {
    category,
    services: servicesResult,
  };
}

// Create new service category
export async function createServiceCategoryService(
  input: CreateServiceCategoryInput,
) {
  const result = await db.insert(serviceCategories).values(input).returning();
  return result[0];
}

// Update existing service category
export async function updateServiceCategoryService(
  id: number,
  input: UpdateServiceCategoryInput,
) {
  const result = await db
    .update(serviceCategories)
    .set(input)
    .where(eq(serviceCategories.id, id))
    .returning();
  return result[0];
}

// Delete service category
export async function deleteServiceCategoryService(id: number) {
  await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
}
