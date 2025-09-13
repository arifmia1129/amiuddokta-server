import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  bdrisApplications,
  bdrisApplicationErrors,
} from "@/db/schema/applications";
import { users } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

// GET - Fetch single BDRIS application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminContext = searchParams.get("admin") === "true";
    
    // If not admin context, require authentication
    let userContext = null;
    if (!isAdminContext) {
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
      userContext = decodeUser;
    }

    // Build where conditions
    const whereConditions = [eq(bdrisApplications.id, parseInt(params.id))];
    
    // For user context, only allow access to their own applications
    if (!isAdminContext && userContext) {
      whereConditions.push(eq(bdrisApplications.userId, Number(userContext.id)));
    }

    // Fetch application with user information
    const applicationResult = await db
      .select({
        // Application fields
        id: bdrisApplications.id,
        userId: bdrisApplications.userId,
        applicationId: bdrisApplications.applicationId,
        applicationType: bdrisApplications.applicationType,
        printLink: bdrisApplications.printLink,
        printLinkExpiry: bdrisApplications.printLinkExpiry,
        status: bdrisApplications.status,
        additionalInfo: bdrisApplications.additionalInfo,
        formData: bdrisApplications.formData,
        rawHtmlResponse: bdrisApplications.rawHtmlResponse,
        responseExtracted: bdrisApplications.responseExtracted,
        submittedAt: bdrisApplications.submittedAt,
        lastChecked: bdrisApplications.lastChecked,
        created_at: bdrisApplications.created_at,
        updated_at: bdrisApplications.updated_at,
        // User fields
        userName: users.name,
        userPhone: users.phone,
        userCenterName: users.center_name,
        userCenterAddress: users.center_address,
      })
      .from(bdrisApplications)
      .leftJoin(users, eq(bdrisApplications.userId, users.id))
      .where(and(...whereConditions))
      .limit(1);

    if (applicationResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found",
        },
        { status: 404 }
      );
    }

    const app = applicationResult[0];
    
    // Transform the result
    const transformedApplication = {
      id: app.id,
      userId: app.userId,
      applicationId: app.applicationId,
      applicationType: app.applicationType,
      printLink: app.printLink,
      printLinkExpiry: app.printLinkExpiry,
      status: app.status,
      additionalInfo: app.additionalInfo,
      formData: app.formData,
      rawHtmlResponse: app.rawHtmlResponse,
      responseExtracted: app.responseExtracted,
      submittedAt: app.submittedAt,
      lastChecked: app.lastChecked,
      created_at: app.created_at,
      updated_at: app.updated_at,
      user: app.userName ? {
        name: app.userName,
        phone: app.userPhone,
        center_name: app.userCenterName,
        center_address: app.userCenterAddress,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: transformedApplication,
    });

  } catch (error) {
    console.error("Error fetching BDRIS application details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch application details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update BDRIS application status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["submitted", "under_review", "approved", "rejected", "expired"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
        },
        { status: 400 }
      );
    }

    // Update the application
    const updatedApplication = await db
      .update(bdrisApplications)
      .set({
        status: status as any,
        updated_at: new Date(),
        ...(notes && { 
          additionalInfo: {
            notes: notes
          }
        })
      })
      .where(eq(bdrisApplications.id, parseInt(params.id)))
      .returning();

    if (updatedApplication.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication[0],
      message: `Application status updated to ${status}`,
    });

  } catch (error) {
    console.error("Error updating BDRIS application:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete BDRIS application (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete the application
    const deletedApplication = await db
      .delete(bdrisApplications)
      .where(eq(bdrisApplications.id, parseInt(params.id)))
      .returning();

    if (deletedApplication.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting BDRIS application:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete application",
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
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};