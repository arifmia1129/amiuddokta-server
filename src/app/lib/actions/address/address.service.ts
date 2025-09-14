"use server";

import { db } from "@/db";
import { addresses } from "@/db/schema/addresses";
import { users } from "@/db/schema/users";
import { eq, desc, asc, like, and } from "drizzle-orm";

export interface AddressCreateData {
  ward_id: number;
  village_bn: string;
  village_en: string;
  post_office_bn: string;
  post_office_en: string;
}

export interface AddressUpdateData extends Partial<AddressCreateData> {
  id: number;
}

export interface AddressQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  wardId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getAllAddressesService = async (
  userId: number,
  params: AddressQueryParams = {}
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      wardId,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(addresses.user_id, userId)];

    if (search) {
      whereConditions.push(like(addresses.village_bn, `%${search}%`));
    }

    if (wardId) {
      whereConditions.push(eq(addresses.ward_id, wardId));
    }

    // Build order by
    const orderByField = sortBy === "created_at" ? addresses.created_at : addresses.village_bn;
    const orderBy = sortOrder === "desc" ? desc(orderByField) : asc(orderByField);

    // Fetch addresses with user information
    const addressesData = await db
      .select({
        id: addresses.id,
        user_id: addresses.user_id,
        ward_id: addresses.ward_id,
        village_bn: addresses.village_bn,
        village_en: addresses.village_en,
        post_office_bn: addresses.post_office_bn,
        post_office_en: addresses.post_office_en,
        created_at: addresses.created_at,
        updated_at: addresses.updated_at,
        user: {
          name: users.name,
          phone: users.phone,
        },
      })
      .from(addresses)
      .leftJoin(users, eq(addresses.user_id, users.id))
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select()
      .from(addresses)
      .where(and(...whereConditions));

    const total = totalResult.length;

    return {
      success: true,
      statusCode: 200,
      data: addressesData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch addresses",
    };
  }
};

export const createAddressService = async (
  userId: number,
  data: AddressCreateData
) => {
  try {
    const { ward_id, village_bn, village_en, post_office_bn, post_office_en } = data;

    if (!ward_id || !village_bn || !village_en || !post_office_bn || !post_office_en) {
      return {
        success: false,
        statusCode: 400,
        message: "All fields are required: ward_id, village_bn, village_en, post_office_bn, post_office_en",
      };
    }

    // Create new address record
    const newAddress = await db
      .insert(addresses)
      .values({
        user_id: userId,
        ward_id: Number(ward_id),
        village_bn,
        village_en,
        post_office_bn,
        post_office_en,
      })
      .returning();

    return {
      success: true,
      statusCode: 201,
      data: newAddress[0],
      message: "Address created successfully",
    };
  } catch (error) {
    console.error("Error creating address:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create address",
    };
  }
};

export const updateAddressService = async (
  userId: number,
  addressId: number,
  data: Partial<AddressCreateData>
) => {
  try {
    // Check if the address exists and belongs to the user
    const existingAddress = await db
      .select()
      .from(addresses)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      ))
      .limit(1);

    if (existingAddress.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Address not found or access denied",
      };
    }

    // Prepare update object with only provided fields
    const updateObject: any = {
      updated_at: new Date(),
    };

    if (data.ward_id !== undefined) updateObject.ward_id = Number(data.ward_id);
    if (data.village_bn !== undefined) updateObject.village_bn = data.village_bn;
    if (data.village_en !== undefined) updateObject.village_en = data.village_en;
    if (data.post_office_bn !== undefined) updateObject.post_office_bn = data.post_office_bn;
    if (data.post_office_en !== undefined) updateObject.post_office_en = data.post_office_en;

    // Update the address
    const updatedAddress = await db
      .update(addresses)
      .set(updateObject)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      ))
      .returning();

    if (updatedAddress.length === 0) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to update address",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: updatedAddress[0],
      message: "Address updated successfully",
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update address",
    };
  }
};

export const deleteAddressService = async (
  userId: number,
  addressId: number
) => {
  try {
    // Check if the address exists and belongs to the user
    const existingAddress = await db
      .select()
      .from(addresses)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      ))
      .limit(1);

    if (existingAddress.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Address not found or access denied",
      };
    }

    // Delete the address
    const deletedAddress = await db
      .delete(addresses)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      ))
      .returning();

    if (deletedAddress.length === 0) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to delete address",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: deletedAddress[0],
      message: "Address deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to delete address",
    };
  }
};