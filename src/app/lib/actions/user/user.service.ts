"use server";

import { db } from "@/db";
import { eq, sql, and, or, desc, asc } from "drizzle-orm";
import { hashPin, comparePin, generateToken } from "@/app/lib/utils/auth.utils";
import {
  CreateUserInput,
  UpdateUserInput,
  LoginUserInput,
  UserFilterInput,
  ChangePinInput,
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

  // Build search conditions - enhanced to search across multiple fields
  const searchCondition = search
    ? createSearchCondition(search, ["name", "phone", "center_name", "center_address"])
    : sql`1=1`;

  // Debug logging for search
  if (search) {
    console.log("🔍 Search Debug:", {
      searchTerm: search,
      fields: ["name", "phone", "center_name", "center_address"],
      cleanedSearch: search.trim().toLowerCase()
    });
  }

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
    phone: users.phone,
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
      phone: users.phone,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      center_name: users.center_name,
      center_address: users.center_address,
      division: users.division,
      district: users.district,
      upazila: users.upazila,
      union: users.union,
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
      phone: users.phone,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      center_name: users.center_name,
      center_address: users.center_address,
      division: users.division,
      district: users.district,
      upazila: users.upazila,
      union: users.union,
      ward: users.ward,
      last_login: users.last_login,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

// Get user by phone
export async function getUserByPhoneService(phone: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  return result[0] || null;
}

// Get user by phone with additional info for update scenarios
export async function getUserByPhoneWithDetailsService(phone: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      status: users.status,
      role: users.role,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  return result[0] || null;
}

// Create new user
export async function createUserService(userData: CreateUserInput) {
  // Hash PIN
  const hashedPin = await hashPin(userData.pin);

  // Prepare insert data matching schema
  const insertData = {
    name: userData.name,
    phone: userData.phone,
    pin: hashedPin,
    role: userData.role as "super_admin" | "admin" | "entrepreneur",
    status: userData.status as "active" | "inactive" | "suspended",
    center_name: userData.center_name,
    center_address: userData.center_address,
    division: userData.division,
    district: userData.district,
    upazila: userData.upazila,
    union: userData.union,
    ward: userData.ward,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Insert user
  const result = await db
    .insert(users)
    .values(insertData)
    .returning({
      id: users.id,
      name: users.name,
      phone: users.phone,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      center_name: users.center_name,
      center_address: users.center_address,
      division: users.division,
      district: users.district,
      upazila: users.upazila,
      union: users.union,
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

  // If PIN is provided, hash it
  if (userData.pin) {
    updates.pin = await hashPin(userData.pin);
  }

  // Update user
  const result = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      phone: users.phone,
      about: users.about,
      role: users.role,
      profile_image: users.profile_image,
      status: users.status,
      center_name: users.center_name,
      center_address: users.center_address,
      division: users.division,
      district: users.district,
      upazila: users.upazila,
      union: users.union,
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
  // Find user by phone
  const user = await getUserByPhoneService(credentials.phone);

  if (!user) {
    return null; // User not found
  }

  // Check if user is active
  if (user.status !== "active") {
    return null; // User account is not active
  }

  // Verify PIN
  const isPinValid = await comparePin(credentials.pin, user.pin);
  if (!isPinValid) {
    return null; // Invalid PIN
  }

  // Update last login
  await db
    .update(users)
    .set({ last_login: new Date() })
    .where(eq(users.id, user.id));

  // Generate token
  const token = generateToken({
    id: user.id,
    phone: user.phone,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profile_image: user.profile_image,
    },
    token,
  };
}

// Change PIN
export async function changePinService(userId: number, data: ChangePinInput) {
  // Get user with PIN
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) {
    return { success: false, message: "User not found" };
  }

  // Verify current PIN
  const isCurrentPinValid = await comparePin(data.currentPin, user[0].pin);
  if (!isCurrentPinValid) {
    return { success: false, message: "Current PIN is incorrect" };
  }

  // Hash new PIN
  const hashedPin = await hashPin(data.newPin);

  // Update PIN
  await db
    .update(users)
    .set({
      pin: hashedPin,
      updated_at: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true, message: "PIN changed successfully" };
}