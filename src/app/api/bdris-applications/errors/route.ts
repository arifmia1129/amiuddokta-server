import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bdrisApplicationErrors } from "@/db/schema";
import { users } from "@/db/schema";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { eq, desc } from "drizzle-orm";

// GET - Retrieve BDRIS application errors (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Fetch errors with user information
    const errors = await db
      .select({
        id: bdrisApplicationErrors.id,
        userId: bdrisApplicationErrors.userId,
        errorType: bdrisApplicationErrors.errorType,
        errorMessage: bdrisApplicationErrors.errorMessage,
        applicationType: bdrisApplicationErrors.applicationType,
        formData: bdrisApplicationErrors.formData,
        rawResponse: bdrisApplicationErrors.rawResponse,
        isResolved: bdrisApplicationErrors.isResolved,
        attemptedAt: bdrisApplicationErrors.created_at,
        user: {
          name: users.name,
          phone: users.phone,
        },
      })
      .from(bdrisApplicationErrors)
      .leftJoin(users, eq(bdrisApplicationErrors.userId, users.id))
      .orderBy(desc(bdrisApplicationErrors.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select()
      .from(bdrisApplicationErrors);
    
    const total = totalResult.length;

    return NextResponse.json({
      success: true,
      data: errors,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching application errors:", error);
    return NextResponse.json(
      { error: "Failed to fetch application errors" },
      { status: 500 }
    );
  }
}

// POST - Log a BDRIS application error
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 },
      );
    }

    const { errorType, errorMessage, applicationType, formData, rawResponse } =
      await request.json();

    if (!errorType || !errorMessage || !applicationType) {
      return NextResponse.json(
        {
          error: "Error type, message, and application type are required",
        },
        { status: 400 },
      );
    }

    // Create new error record
    const newError = await db
      .insert(bdrisApplicationErrors)
      .values({
        userId: Number(decodeUser.id),
        errorType,
        errorMessage,
        applicationType,
        formData,
        rawResponse,
        isResolved: false,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newError[0],
        message: "Error logged successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error logging error:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
