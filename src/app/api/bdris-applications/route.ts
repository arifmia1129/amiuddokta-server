import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bdrisApplications } from "@/db/schema/applications";
import { eq, desc, and } from "drizzle-orm";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

// GET - Fetch user's BDRIS applications
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // Filter by application type
    const status = searchParams.get("status"); // Filter by status
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions = [eq(bdrisApplications.userId, Number(decodeUser.id))];

    if (type) {
      whereConditions.push(eq(bdrisApplications.applicationType, type as any));
    }

    if (status) {
      whereConditions.push(eq(bdrisApplications.status, status as any));
    }

    const applications = await db
      .select()
      .from(bdrisApplications)
      .where(and(...whereConditions))
      .orderBy(desc(bdrisApplications.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: applications,
      total: applications.length,
    });
  } catch (error) {
    console.error("BDRIS applications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch BDRIS applications" },
      { status: 500 },
    );
  }
}

// POST - Save a successful BDRIS application
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

    const {
      applicationId,
      applicationType,
      printLink,
      additionalInfo,
      formData,
      rawHtmlResponse,
    } = await request.json();

    if (!applicationId || !applicationType) {
      return NextResponse.json(
        {
          error: "Application ID and type are required",
        },
        { status: 400 },
      );
    }

    // Check if application already exists
    const existing = await db
      .select()
      .from(bdrisApplications)
      .where(
        and(
          eq(bdrisApplications.userId, Number(decodeUser.id)),
          eq(bdrisApplications.applicationId, applicationId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing application
      const updated = await db
        .update(bdrisApplications)
        .set({
          printLink,
          additionalInfo,
          formData,
          lastChecked: new Date(),
          updated_at: new Date(),
        })
        .where(eq(bdrisApplications.id, existing[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        data: updated[0],
        message: "Application updated successfully",
      });
    } else {
      // Create new application
      const newApplication = await db
        .insert(bdrisApplications)
        .values({
          userId: Number(decodeUser.id),
          applicationId,
          applicationType,
          printLink,
          additionalInfo,
          formData,
          status: "submitted",
          responseExtracted: true,
          submittedAt: new Date(),
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          data: newApplication[0],
          message: "Application saved successfully",
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("BDRIS application save error:", error);
    return NextResponse.json(
      { error: "Failed to save BDRIS application" },
      { status: 500 },
    );
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
