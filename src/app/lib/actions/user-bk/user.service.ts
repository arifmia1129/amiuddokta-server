"use server";

import { db } from "@/db";
import { and, count, desc, eq, not, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "@/db/schema";
import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";

/**
 * Hashes a password using bcrypt.
 * @param password Plain-text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Service to create a new user.
 */
export const createUserService = async (data: any) => {
  try {
    data.password = await hashPassword(data.password);
    return await db.insert(users).values(data);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
};

/**
 * Service to retrieve a paginated list of users.
 */
export const retrieveUserListService = async (pagination: any) => {
  try {
    const { page, pageSize } = pagination;
    const usersList = await db
      .select()
      .from(users)
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(users.id));

    const totalCount = await db.select({ count: count() }).from(users);

    return { data: usersList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving user list");
  }
};

export const retrieveSubAgentsByAgentIdService = async (
  agentId: number,
  pagination: any,
) => {
  try {
    const { page, pageSize } = pagination;

    // Fetch the sub-agents associated with the given agent ID
    const subAgents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        contact: users.contact,
        balance: users.balance,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
        // Add other fields as needed
      })
      .from(users)
      .where(eq(users.parent_id, agentId)) // Filter by parent_id (agent ID)
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(users.id)); // Order by most recent first

    // Get the total count of sub-agents for pagination metadata
    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.parent_id, agentId));

    return { data: subAgents, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error(error.message || "Error retrieving sub-agents");
  }
};

/**
 * Service to retrieve a user by ID.
 */
export const retrieveUserByIdService = async (id: number) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id));
    if (!user.length) throw new Error("User not found");
    return user[0];
  } catch (error: any) {
    throw new Error(error.message || "Error retrieving user");
  }
};

/**
 * Service to update a user by ID, including password change functionality.
 */
export const updateUserByIdService = async (data: any) => {
  const { newPassword, currentPassword } = data;
  try {
    // If a new password is provided, handle password change
    if (newPassword && currentPassword) {
      const res = await db.select().from(users).where(eq(users.id, data.id));
      const user = res[0];

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password as string,
      );
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Hash the new password
      data.password = await bcrypt.hash(newPassword, 10);
    }

    // Update the user with the provided data
    return await db.update(users).set(data).where(eq(users.id, data.id));
  } catch (error: any) {
    throw new Error(error.message || "Failed to update user");
  }
};

/**
 * Service to delete a user by ID.
 */
export const deleteUserByIdService = async (id: number) => {
  try {
    return await db.delete(users).where(eq(users.id, id));
  } catch (error: any) {
    throw new Error("Failed to delete user");
  }
};

/**
 * Service to search users with pagination.
 */
export const retrieveUserSearchService = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const { keyword } = searchParams;
    const keywordPattern = `%${keyword}%`;

    const searchConditions = or(
      sql`LOWER(${users.name}) LIKE LOWER(${keywordPattern})`,
      sql`LOWER(${users.email}) LIKE LOWER(${keywordPattern})`,
    );

    const results = await db
      .select()
      .from(users)
      .where(and(searchConditions))
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(users.id));

    const totalCount = await db.select({ count: count() }).from(users);

    return { data: results, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Search failed");
  }
};

/**
 * Service to retrieve a paginated list of admins (excluding super admins).
 */
export const retrieveAdminListService = async (pagination: any) => {
  try {
    const { page, pageSize } = pagination;

    const adminList = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin")) // Exclude super admins
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(users.id));

    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "admin"));

    return { data: adminList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving admin list");
  }
};
