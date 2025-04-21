"use server";

import { db } from "@/db";
import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "@/app/lib/utils/auth.utils";
import {
  CreateUserInput,
  UpdateUserInput,
  LoginUserInput,
  UserFilterInput,
  ChangePasswordInput,
} from "./user.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { users } from "@/db/schema/users";

export async function getUsersService(options: UserFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    role,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, ["name", "email", "contact"])
    : sql`1=1`;

  // Build status condition
  const statusCondition = status ? sql`status = ${status}` : sql`1=1`;

  // Build role condition
  const roleCondition = role ? sql`role = ${role}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(searchCondition, statusCondition, roleCondition);

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    created_at: users.created_at,
    updated_at: users.updated_at,
    last_login: users.last_login,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] || users.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      contact: users.contact,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      nid: users.nid,
      years_of_experience: users.years_of_experience,
      center_name: users.center_name,
      center_address: users.center_address,
      reason_to_join: users.reason_to_join,
      last_login: users.last_login,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single user by ID
export async function getUserByIdService(id: number) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      contact: users.contact,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      nid: users.nid, // Include new fields
      years_of_experience: users.years_of_experience,
      center_name: users.center_name,
      center_address: users.center_address,
      reason_to_join: users.reason_to_join,
      last_login: users.last_login,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

// Get user by email
export async function getUserByEmailService(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

// Create new user
export async function createUserService(userData: CreateUserInput) {
  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Insert user
  const result = await db
    .insert(users)
    .values({
      ...userData,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      contact: users.contact,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      nid: users.nid, // Include new fields
      years_of_experience: users.years_of_experience,
      center_name: users.center_name,
      center_address: users.center_address,
      reason_to_join: users.reason_to_join,
      created_at: users.created_at,
    });

  return result[0];
}

// Update existing user
export async function updateUserService(id: number, userData: UpdateUserInput) {
  const updates: any = {
    ...userData,
    updated_at: new Date(),
  };

  // If password is provided, hash it
  if (userData.password) {
    updates.password = await hashPassword(userData.password);
  }

  // Update user
  const result = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      contact: users.contact,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      nid: users.nid, // Include new fields
      years_of_experience: users.years_of_experience,
      center_name: users.center_name,
      center_address: users.center_address,
      reason_to_join: users.reason_to_join,
      updated_at: users.updated_at,
    });

  return result[0] || null;
}

// Delete user
export async function deleteUserService(id: number) {
  await db.delete(users).where(eq(users.id, id));
  return true;
}

// Authentication related methods
export async function loginService(credentials: LoginUserInput) {
  // Find user by email
  const user = await getUserByEmailService(credentials.email);
  if (!user) {
    return null; // User not found
  }

  // Check if user is active
  if (user.status !== "active") {
    return null; // User account is not active
  }

  // Verify password
  const isPasswordValid = await comparePassword(
    credentials.password,
    user.password,
  );
  if (!isPasswordValid) {
    return null; // Invalid password
  }

  // Update last login
  await db
    .update(users)
    .set({ last_login: new Date() })
    .where(eq(users.id, user.id));

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
    },
    token,
  };
}

// Change password
export async function changePasswordService(
  userId: number,
  data: ChangePasswordInput,
) {
  // Get user with password
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) {
    return { success: false, message: "User not found" };
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(
    data.currentPassword,
    user[0].password,
  );
  if (!isCurrentPasswordValid) {
    return { success: false, message: "Current password is incorrect" };
  }

  // Hash new password
  const hashedPassword = await hashPassword(data.newPassword);

  // Update password
  await db
    .update(users)
    .set({
      password: hashedPassword,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true, message: "Password changed successfully" };
}
