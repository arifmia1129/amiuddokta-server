import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const { currentPin, newPin } = await request.json();

    if (!currentPin || !newPin) {
      return NextResponse.json(
        {
          success: false,
          message: "Current PIN and new PIN are required",
        },
        { status: 400 }
      );
    }

    if (newPin.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "New PIN must be at least 4 digits",
        },
        { status: 400 }
      );
    }

    // Get user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(decodeUser.id)))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Verify current PIN
    const isCurrentPinValid = await bcrypt.compare(currentPin, user.pin);
    if (!isCurrentPinValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current PIN is incorrect",
        },
        { status: 400 }
      );
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
      .where(eq(users.id, Number(decodeUser.id)));

    return NextResponse.json({
      success: true,
      message: "PIN changed successfully",
    });

  } catch (error) {
    console.error("PIN change error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to change PIN",
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