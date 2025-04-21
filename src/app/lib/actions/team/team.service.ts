"use server";

import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateTeamInput,
  UpdateTeamInput,
  TeamFilterInput,
} from "./team.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { team } from "@/db/schema/team";

export async function getTeamMembersService(options: TeamFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    is_featured,
    sortBy = "order",
    sortOrder = "asc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["name", "position", "bio"])
    : sql`1=1`;

  // Build featured condition
  const featuredCondition =
    is_featured !== undefined ? sql`is_featured = ${is_featured}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, featuredCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(team)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: team.id,
    name: team.name,
    position: team.position,
    order: team.order,
    created_at: team.created_at,
    updated_at: team.updated_at,
  };

  // Safely access the sort column with a fallback to order
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] || team.order;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: team.id,
      name: team.name,
      position: team.position,
      bio: team.bio,
      profile_image: team.profile_image,
      order: team.order,
      social_links: team.social_links,
      is_featured: team.is_featured,
      created_at: team.created_at,
      updated_at: team.updated_at,
    })
    .from(team)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  // Parse social_links from text to JSON
  const parsedResult = result.map((member) => ({
    ...member,
    social_links: member.social_links ? JSON.parse(member.social_links) : {},
  }));

  return {
    data: parsedResult,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single team member by ID
export async function getTeamMemberByIdService(id: number) {
  const result = await db.select().from(team).where(eq(team.id, id)).limit(1);

  if (!result[0]) return null;

  // Parse social_links from text to JSON
  return {
    ...result[0],
    social_links: result[0].social_links
      ? JSON.parse(result[0].social_links)
      : {},
  };
}

// Create new team member
export async function createTeamMemberService(input: CreateTeamInput) {
  // Stringify social_links if provided
  const dataToInsert = {
    ...input,
    social_links: input.social_links
      ? JSON.stringify(input.social_links)
      : null,
  };

  const result = await db
    .insert(team)
    .values(dataToInsert as any)
    .returning();

  // Parse social_links from text to JSON for the response
  return {
    ...result[0],
    social_links: result[0].social_links
      ? JSON.parse(result[0].social_links)
      : {},
  };
}

// Update existing team member
export async function updateTeamMemberService(
  id: number,
  input: UpdateTeamInput,
) {
  // Stringify social_links if provided
  const dataToUpdate = {
    ...input,
    social_links: input.social_links
      ? JSON.stringify(input.social_links)
      : undefined,
  };

  const result = await db
    .update(team)
    .set(dataToUpdate as any)
    .where(eq(team.id, id))
    .returning();

  if (!result[0]) return null;

  // Parse social_links from text to JSON for the response
  return {
    ...result[0],
    social_links: result[0].social_links
      ? JSON.parse(result[0].social_links)
      : {},
  };
}

// Delete team member
export async function deleteTeamMemberService(id: number) {
  await db.delete(team).where(eq(team.id, id));
}
