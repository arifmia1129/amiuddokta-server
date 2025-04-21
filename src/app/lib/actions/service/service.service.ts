// src/app/lib/actions/service/service.service.ts
import { db } from "@/db";
import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import { services } from "@/db/schema/services";
import {
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFilterInput, // Import the types correctly
} from "./service.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";

export async function getServicesService(options: ServiceFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_active,
    is_featured,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, [
        "name",
        "short_description",
        "description",
      ])
    : sql`1=1`;

  // Build status condition
  const activeCondition =
    is_active !== undefined ? sql`is_active = ${is_active}` : sql`1=1`;

  // Build featured condition
  const featuredCondition =
    is_featured !== undefined ? sql`is_featured = ${is_featured}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(
    searchCondition,
    activeCondition,
    featuredCondition,
  );

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(services)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: services.id,
    name: services.name,
    price: services.price,
    is_featured: services.is_featured,
    is_active: services.is_active,
    created_at: services.created_at,
    updated_at: services.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    services.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: services.id,
      category_id: services.category_id,
      name: services.name,
      slug: services.slug,
      short_description: services.short_description,
      description: services.description,
      icon: services.icon,
      featured_image: services.featured_image,
      price: services.price,
      is_featured: services.is_featured,
      is_active: services.is_active,
      sort_order: services.sort_order,
      created_at: services.created_at,
      updated_at: services.updated_at,
    })
    .from(services)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single service by ID
export async function getServiceByIdService(id: number) {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new service
export async function createServiceService(input: CreateServiceInput) {
  const result = await db
    .insert(services)
    .values({ ...input, price: input.price ? input.price.toString() : null })
    .returning();
  return result[0];
}

export async function updateServiceService(
  id: number,
  input: UpdateServiceInput,
) {
  const result = await db
    .update(services)
    .set({ ...input, price: input.price ? input.price.toString() : null })
    .where(eq(services.id, id))
    .returning();
  return result[0];
}

// Delete service
export async function deleteServiceService(id: number) {
  await db.delete(services).where(eq(services.id, id));
}
