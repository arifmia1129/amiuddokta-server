// src/app/lib/utils/pagination.utils.ts
import { sql } from "drizzle-orm";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function getPaginationParams(options: PaginationOptions): {
  limit: number;
  offset: number;
  orderBy: string;
} {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const offset = (page - 1) * limit;

  const sortBy = options.sortBy || "created_at";
  const sortOrder = options.sortOrder || "desc";
  const orderBy = `${sortBy} ${sortOrder}`;

  return { limit, offset, orderBy };
}

export function buildPaginationMeta(
  total: number,
  options: PaginationOptions,
): PaginationMeta {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const pages = Math.ceil(total / limit);

  return { total, page, limit, pages };
}

export function createSearchCondition(
  searchQuery: string | undefined,
  fields: string[],
): any {
  if (!searchQuery || !searchQuery.trim()) {
    return sql`1=1`; // Always true condition
  }

  const searchTerm = `%${searchQuery.trim()}%`;
  const conditions = fields.map(
    (field) => sql`${sql.raw(field)} ILIKE ${searchTerm}`,
  );

  // Combine with OR
  return sql.join(conditions, sql` OR `);
}
