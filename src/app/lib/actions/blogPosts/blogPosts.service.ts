"use server";

// src/app/lib/actions/blog/blog.service.ts
import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPostFilterInput,
} from ".//blogPosts.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { blogPosts, blogCategories } from "@/db/schema/blogs";

export async function getBlogPostsService(options: BlogPostFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_published,
    sortBy = "created_at",
    sortOrder = "desc",
    category_id,
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["title", "excerpt", "content"])
    : sql`1=1`;

  // Build status condition
  const publishedCondition =
    is_published !== undefined ? sql`is_published = ${is_published}` : sql`1=1`;

  // Build category condition
  const categoryCondition =
    category_id !== undefined ? sql`category_id = ${category_id}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(
    searchCondition,
    publishedCondition,
    categoryCondition,
  );

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: blogPosts.id,
    title: blogPosts.title,
    published_at: blogPosts.published_at,
    is_published: blogPosts.is_published,
    created_at: blogPosts.created_at,
    updated_at: blogPosts.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] ||
    blogPosts.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featured_image: blogPosts.featured_image,
      author_id: blogPosts.author_id,
      category_id: blogPosts.category_id,
      is_published: blogPosts.is_published,
      published_at: blogPosts.published_at,
      created_at: blogPosts.created_at,
      updated_at: blogPosts.updated_at,
    })
    .from(blogPosts)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single blog post by ID
export async function getBlogPostByIdService(id: number) {
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  return result[0] || null;
}

// Create new blog post
export async function createBlogPostService(input: CreateBlogPostInput) {
  const result = await db
    .insert(blogPosts)
    .values(input as any)
    .returning();
  return result[0];
}

// Update existing blog post
export async function updateBlogPostService(
  id: number,
  input: UpdateBlogPostInput,
) {
  const result = await db
    .update(blogPosts)
    .set(input as any)
    .where(eq(blogPosts.id, id))
    .returning();
  return result[0];
}

// Delete blog post
export async function deleteBlogPostService(id: number) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
