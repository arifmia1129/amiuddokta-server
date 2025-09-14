import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isAdminReset = false } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Find the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Generate a temporary password (8 characters: 4 digits + 4 letters)
    const generateTempPassword = () => {
      const digits = Math.floor(1000 + Math.random() * 9000).toString();
      const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
      return digits + letters;
    };

    const temporaryPassword = generateTempPassword();
    
    // Hash the temporary password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

    // Update the user's password (using PIN field for BDRIS users)
    await db
      .update(users)
      .set({
        pin: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      temporaryPassword: isAdminReset ? temporaryPassword : undefined, // Only return password for admin resets
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};