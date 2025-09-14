import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  bdrisApplications,
  bdrisApplicationErrors,
} from "@/db/schema/applications";
import { users } from "@/db/schema/users";
import { eq, desc, asc, and, or, like, gte, lte, sql } from "drizzle-orm";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

// GET - Fetch BDRIS applications (user or admin context)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminContext = searchParams.get("admin") === "true";
    
    // If admin context, allow access without strict auth (for now - should be improved)
    let userContext = null;
    
    if (!isAdminContext) {
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
      userContext = decodeUser;
    }

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || isAdminContext ? "10" : "50");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where conditions
    const whereConditions = [];
    
    // For user context, only show their applications
    if (!isAdminContext && userContext) {
      whereConditions.push(eq(bdrisApplications.userId, Number(userContext.id)));
    }
    
    if (type && type !== "ALL") {
      whereConditions.push(eq(bdrisApplications.applicationType, type as any));
    }
    
    if (search) {
      whereConditions.push(
        or(
          like(bdrisApplications.applicationId, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      );
    }
    
    if (startDate) {
      whereConditions.push(gte(bdrisApplications.submittedAt, new Date(startDate)));
    }
    
    if (endDate) {
      whereConditions.push(lte(bdrisApplications.submittedAt, new Date(endDate + " 23:59:59")));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;

    // Determine sort order using sql literals
    let orderBy;
    if (order === "desc") {
      switch(sort) {
        case "applicationId":
          orderBy = desc(bdrisApplications.applicationId);
          break;
        case "applicationType":
          orderBy = desc(bdrisApplications.applicationType);
          break;
        case "submittedAt":
          orderBy = desc(bdrisApplications.submittedAt);
          break;
        default:
          orderBy = desc(bdrisApplications.created_at);
      }
    } else {
      switch(sort) {
        case "applicationId":
          orderBy = asc(bdrisApplications.applicationId);
          break;
        case "applicationType":
          orderBy = asc(bdrisApplications.applicationType);
          break;
        case "submittedAt":
          orderBy = asc(bdrisApplications.submittedAt);
          break;
        default:
          orderBy = asc(bdrisApplications.created_at);
      }
    }

    // Get total count for admin context
    let total = 0;
    if (isAdminContext) {
      const totalResult = await db
        .select({ count: sql`count(*)`.as('count') })
        .from(bdrisApplications)
        .leftJoin(users, eq(bdrisApplications.userId, users.id))
        .where(whereClause);

      total = Number(totalResult[0]?.count || 0);
    }

    // Get paginated results with user information (for admin) or just applications (for user)
    const applications = await db
      .select({
        // Application fields
        id: bdrisApplications.id,
        userId: bdrisApplications.userId,
        applicationId: bdrisApplications.applicationId,
        applicationType: bdrisApplications.applicationType,
        additionalInfo: bdrisApplications.additionalInfo,
        formData: bdrisApplications.formData,
        rawHtmlResponse: bdrisApplications.rawHtmlResponse,
        responseExtracted: bdrisApplications.responseExtracted,
        submittedAt: bdrisApplications.submittedAt,
        lastChecked: bdrisApplications.lastChecked,
        created_at: bdrisApplications.created_at,
        updated_at: bdrisApplications.updated_at,
        // User fields (only for admin)
        ...(isAdminContext && {
          userName: users.name,
          userPhone: users.phone,
        }),
      })
      .from(bdrisApplications)
      .leftJoin(users, eq(bdrisApplications.userId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    // Transform results for admin context
    let responseData;
    if (isAdminContext) {
      const transformedApplications = applications.map(app => ({
        id: app.id,
        userId: app.userId,
        applicationId: app.applicationId,
        applicationType: app.applicationType,
        additionalInfo: app.additionalInfo,
        formData: app.formData,
        rawHtmlResponse: app.rawHtmlResponse,
        responseExtracted: app.responseExtracted,
        submittedAt: app.submittedAt,
        lastChecked: app.lastChecked,
        created_at: app.created_at,
        updated_at: app.updated_at,
        user: (app as any).userName ? {
          name: (app as any).userName,
          phone: (app as any).userPhone,
        } : null,
      }));

      responseData = {
        applications: transformedApplications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      // For user context, return simple format
      responseData = applications;
      total = applications.length;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      ...(isAdminContext && { total }),
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
          additionalInfo,
          formData,
          rawHtmlResponse,
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
          additionalInfo,
          formData,
          rawHtmlResponse,
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
