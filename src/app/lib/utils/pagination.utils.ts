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

  // Clean and normalize search query
  const cleanQuery = searchQuery.trim().toLowerCase();
  
  // For single word search, use simple OR logic across all fields
  // For multi-word search, each word should match at least one field
  const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 0);
  
  if (searchTerms.length === 0) {
    return sql`1=1`;
  }

  if (searchTerms.length === 1) {
    // Single term: search in any field (handle NULL values)
    const searchPattern = `%${searchTerms[0]}%`;
    const fieldConditions = fields.map(
      (field) => sql`LOWER(COALESCE(${sql.raw(field)}, '')) LIKE ${searchPattern}`,
    );
    return sql.join(fieldConditions, sql` OR `);
  } else {
    // Multiple terms: each term should be found in at least one field (more flexible)
    const termConditions = searchTerms.map(term => {
      const searchPattern = `%${term}%`;
      const fieldConditions = fields.map(
        (field) => sql`LOWER(COALESCE(${sql.raw(field)}, '')) LIKE ${searchPattern}`,
      );
      return sql`(${sql.join(fieldConditions, sql` OR `)})`;
    });
    
    // Use AND for better precision - all terms must be found
    return sql.join(termConditions, sql` AND `);
  }
}

export function createAdvancedSearchCondition(
  searchQuery: string | undefined,
  fields: string[],
  options: {
    exactMatch?: boolean;
    caseInsensitive?: boolean;
    partialMatch?: boolean;
  } = {},
): any {
  if (!searchQuery || !searchQuery.trim()) {
    return sql`1=1`; // Always true condition
  }

  const { exactMatch = false, caseInsensitive = true, partialMatch = true } = options;
  
  let cleanQuery = searchQuery.trim();
  if (caseInsensitive) {
    cleanQuery = cleanQuery.toLowerCase();
  }

  let searchPattern: string;
  if (exactMatch) {
    searchPattern = cleanQuery;
  } else if (partialMatch) {
    searchPattern = `%${cleanQuery}%`;
  } else {
    searchPattern = `${cleanQuery}%`; // Starts with
  }

  const conditions = fields.map((field) => {
    if (caseInsensitive) {
      if (exactMatch) {
        return sql`LOWER(${sql.raw(field)}) = ${searchPattern}`;
      } else {
        return sql`LOWER(${sql.raw(field)}) LIKE ${searchPattern}`;
      }
    } else {
      if (exactMatch) {
        return sql`${sql.raw(field)} = ${searchPattern}`;
      } else {
        return sql`${sql.raw(field)} LIKE ${searchPattern}`;
      }
    }
  });

  // Combine with OR
  return sql.join(conditions, sql` OR `);
}
