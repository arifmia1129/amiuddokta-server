"use server";

import { db } from "@/db";
import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import {
  CreateAddressInput,
  UpdateAddressInput,
  AddressFilterInput,
} from "./address.validation";
import { addresses } from "@/db/schema/addresses";
import { buildPaginationMeta } from "@/app/lib/utils/pagination.utils";

export async function getAddressesService(options: AddressFilterInput) {
  const {
    page = 1,
    limit = 10,
    ward_id,
    user_id,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build ward_id condition
  const wardCondition = ward_id ? sql`ward_id = ${ward_id}` : sql`1=1`;

  // Build user_id condition
  const userCondition = user_id ? sql`user_id = ${user_id}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(wardCondition, userCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(addresses)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: addresses.id,
    user_id: addresses.user_id,
    ward_id: addresses.ward_id,
    post_office_bn: addresses.post_office_bn,
    post_office_en: addresses.post_office_en,
    village_bn: addresses.village_bn,
    village_en: addresses.village_en,
    created_at: addresses.created_at,
    updated_at: addresses.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    addresses.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select()
    .from(addresses)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single address by ID
export async function getAddressByIdService(id: number) {
  const result = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new address
export async function createAddressService(addressData: CreateAddressInput) {
  const result = await db
    .insert(addresses)
    .values({
      ...addressData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return result[0];
}

// Update existing address
export async function updateAddressService(
  id: number,
  addressData: UpdateAddressInput,
) {
  const result = await db
    .update(addresses)
    .set({
      ...addressData,
      updated_at: new Date(),
    })
    .where(eq(addresses.id, id))
    .returning();

  return result[0] || null;
}

// Delete address
export async function deleteAddressService(id: number) {
  await db.delete(addresses).where(eq(addresses.id, id));
  return true;
}
