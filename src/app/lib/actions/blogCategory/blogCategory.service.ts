"use server";

// src/app/lib/actions/blogCategory/blogCategory.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  BlogCategoryFilterInput,
} from "./blogCategory.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { blogCategories, blogPosts } from "@/db/schema/blogs";

export async function getBlogCategoriesService(
  options: BlogCategoryFilterInput,
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
    .from(blogCategories)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: blogCategories.id,
    name: blogCategories.name,
    sort_order: blogCategories.sort_order,
    is_active: blogCategories.is_active,
    created_at: blogCategories.created_at,
    updated_at: blogCategories.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    blogCategories.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: blogCategories.id,
      name: blogCategories.name,
      slug: blogCategories.slug,
      featured_image: blogCategories.featured_image,
      description: blogCategories.description,
      sort_order: blogCategories.sort_order,
      is_active: blogCategories.is_active,
      created_at: blogCategories.created_at,
      updated_at: blogCategories.updated_at,
    })
    .from(blogCategories)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single blog category by ID
export async function getBlogCategoryByIdService(id: number) {
  const result = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new blog category
export async function createBlogCategoryService(
  input: CreateBlogCategoryInput,
) {
  const result = await db.insert(blogCategories).values(input).returning();
  return result[0];
}

// Update existing blog category
export async function updateBlogCategoryService(
  id: number,
  input: UpdateBlogCategoryInput,
) {
  const result = await db
    .update(blogCategories)
    .set(input)
    .where(eq(blogCategories.id, id))
    .returning();
  return result[0];
}

// Delete blog category
export async function deleteBlogCategoryService(id: number) {
  await db.delete(blogCategories).where(eq(blogCategories.id, id));
}

// Get single blog category by slug
export async function getBlogCategoryBySlugService(slug: string) {
  // Fetch the category by slug
  const categoryResult = await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug))
    .limit(1);

  const category = categoryResult[0];

  if (!category) {
    return null;
  }

  // Fetch the associated blog posts
  const postsResult = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.category_id, category.id));

  return {
    category,
    posts: postsResult,
  };
}
