import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and status are required",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["active", "inactive", "suspended"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be one of: active, inactive, suspended",
        },
        { status: 400 }
      );
    }

    // Find the user first to ensure they exist
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

    // Update the user's status
    const updatedUser = await db
      .update(users)
      .set({
        status: status as "active" | "inactive" | "suspended",
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        phone: users.phone,
        status: users.status,
      });

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      data: updatedUser[0],
    });

  } catch (error) {
    console.error("User status update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user status",
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
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};