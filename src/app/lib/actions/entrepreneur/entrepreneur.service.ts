"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface EntrepreneurProfileUpdateData {
  name?: string;
  phone?: string;
  about?: string;
  center_name?: string;
  center_address?: string;
  // Note: division, district, upazila, union, ward are NOT editable as requested
}

export interface PinUpdateData {
  currentPin: string;
  newPin: string;
}

export const getEntrepreneurProfileService = async (userId: number) => {
  try {
    const userResult = await db
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
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    const user = userResult[0];

    // Don't return the pin for security
    return {
      success: true,
      statusCode: 200,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching entrepreneur profile:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch profile",
    };
  }
};

export const updateEntrepreneurProfileService = async (
  userId: number,
  updateData: EntrepreneurProfileUpdateData
) => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    // If phone is being updated, check if it's unique
    if (updateData.phone && updateData.phone !== existingUser[0].phone) {
      const phoneExists = await db
        .select()
        .from(users)
        .where(eq(users.phone, updateData.phone))
        .limit(1);

      if (phoneExists.length > 0) {
        return {
          success: false,
          statusCode: 400,
          message: "Phone number already exists",
        };
      }
    }

    // Prepare update object with only editable fields
    const updateObject: any = {
      updated_at: new Date(),
    };

    if (updateData.name !== undefined) updateObject.name = updateData.name;
    if (updateData.phone !== undefined) updateObject.phone = updateData.phone;
    if (updateData.about !== undefined) updateObject.about = updateData.about;
    if (updateData.center_name !== undefined) updateObject.center_name = updateData.center_name;
    if (updateData.center_address !== undefined) updateObject.center_address = updateData.center_address;

    // Update the user profile
    const updatedUser = await db
      .update(users)
      .set(updateObject)
      .where(eq(users.id, userId))
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
        ward: users.ward,
        updated_at: users.updated_at,
      });

    if (updatedUser.length === 0) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to update profile",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: updatedUser[0],
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating entrepreneur profile:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update profile",
    };
  }
};

export const updateEntrepreneurPinService = async (
  userId: number,
  pinData: PinUpdateData
) => {
  try {
    const { currentPin, newPin } = pinData;

    if (!currentPin || !newPin) {
      return {
        success: false,
        statusCode: 400,
        message: "Current PIN and new PIN are required",
      };
    }

    if (newPin.length < 4) {
      return {
        success: false,
        statusCode: 400,
        message: "New PIN must be at least 4 characters",
      };
    }

    // Get user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    const user = userResult[0];

    // Verify current PIN
    const isPinValid = await bcrypt.compare(currentPin, user.pin);
    if (!isPinValid) {
      return {
        success: false,
        statusCode: 400,
        message: "Current PIN is incorrect",
      };
    }

    // Hash new PIN
    const saltRounds = 12;
    const hashedNewPin = await bcrypt.hash(newPin, saltRounds);

    // Update PIN in database
    await db
      .update(users)
      .set({
        pin: hashedNewPin,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      statusCode: 200,
      message: "PIN updated successfully",
    };
  } catch (error) {
    console.error("Error updating entrepreneur PIN:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update PIN",
    };
  }
};

export const updateEntrepreneurProfileImageService = async (
  userId: number,
  imagePath: string
) => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    // Update profile image
    const updatedUser = await db
      .update(users)
      .set({
        profile_image: imagePath,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        profile_image: users.profile_image,
        updated_at: users.updated_at,
      });

    if (updatedUser.length === 0) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to update profile image",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: {
        profile_image: updatedUser[0].profile_image,
      },
      message: "Profile image updated successfully",
    };
  } catch (error) {
    console.error("Error updating entrepreneur profile image:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update profile image",
    };
  }
};