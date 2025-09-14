"use server";

import { db } from "@/db";
import { 
  bdrisApplications, 
  bdrisApplicationErrors 
} from "@/db/schema/applications";
import { users } from "@/db/schema/users";
import { eq, desc, asc, and, or, like, gte, lte, sql } from "drizzle-orm";

interface GetBdrisApplicationsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  isAdminContext?: boolean;
  userId?: number;
}

export async function getBdrisApplications(params: GetBdrisApplicationsParams) {
  const {
    page = 1,
    limit = 10,
    sort = "created_at",
    order = "desc",
    type,
    search,
    startDate,
    endDate,
    isAdminContext = false,
    userId
  } = params;

  try {
    // Build where conditions
    const whereConditions = [];
    
    // For user context, only show their applications
    if (!isAdminContext && userId) {
      whereConditions.push(eq(bdrisApplications.userId, Number(userId)));
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

    // Determine sort order
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

    // Transform results 
    const transformedApplications = applications.map(app => ({
      id: app.id.toString(),
      userId: app.userId,
      applicationId: app.applicationId,
      applicationType: app.applicationType,
      additionalInfo: app.additionalInfo || undefined,
      formData: app.formData,
      responseExtracted: app.responseExtracted || false,
      submittedAt: app.submittedAt?.toISOString() || '',
      lastChecked: app.lastChecked?.toISOString() || '',
      created_at: app.created_at?.toISOString() || '',
      updated_at: app.updated_at?.toISOString() || '',
      user: (app as any).userName ? {
        name: (app as any).userName,
        phone: (app as any).userPhone || '',
      } : undefined,
    }));

    if (isAdminContext) {
      return {
        applications: transformedApplications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      // For user context, still return in admin format for consistency
      return {
        applications: transformedApplications,
        total: transformedApplications.length,
        page,
        limit,
        totalPages: Math.ceil(transformedApplications.length / limit),
      };
    }
  } catch (error) {
    console.error("BDRIS applications fetch error:", error);
    throw new Error("Failed to fetch BDRIS applications");
  }
}

export async function getBdrisApplicationById(id: string) {
  try {
    const application = await db
      .select({
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
        userName: users.name,
        userPhone: users.phone,
      })
      .from(bdrisApplications)
      .leftJoin(users, eq(bdrisApplications.userId, users.id))
      .where(eq(bdrisApplications.id, parseInt(id)))
      .limit(1);

    if (application.length === 0) {
      throw new Error("Application not found");
    }

    const app = application[0];
    return {
      id: app.id.toString(),
      userId: app.userId,
      applicationId: app.applicationId,
      applicationType: app.applicationType,
      additionalInfo: app.additionalInfo || undefined,
      formData: app.formData,
      responseExtracted: app.responseExtracted || false,
      submittedAt: app.submittedAt?.toISOString() || '',
      lastChecked: app.lastChecked?.toISOString() || '',
      created_at: app.created_at?.toISOString() || '',
      updated_at: app.updated_at?.toISOString() || '',
      user: app.userName ? {
        name: app.userName,
        phone: app.userPhone || '',
      } : undefined,
    };
  } catch (error) {
    console.error("BDRIS application fetch error:", error);
    throw new Error("Failed to fetch BDRIS application");
  }
}

export async function getBdrisApplicationErrors() {
  try {
    const errors = await db
      .select({
        id: bdrisApplicationErrors.id,
        userId: bdrisApplicationErrors.userId,
        errorType: bdrisApplicationErrors.errorType,
        errorMessage: bdrisApplicationErrors.errorMessage,
        applicationType: bdrisApplicationErrors.applicationType,
        formData: bdrisApplicationErrors.formData,
        created_at: bdrisApplicationErrors.created_at,
        userName: users.name,
        userPhone: users.phone,
      })
      .from(bdrisApplicationErrors)
      .leftJoin(users, eq(bdrisApplicationErrors.userId, users.id))
      .orderBy(desc(bdrisApplicationErrors.created_at));

    const transformedErrors = errors.map(error => ({
      id: error.id.toString(),
      userId: error.userId,
      errorType: error.errorType,
      errorMessage: error.errorMessage,
      applicationType: error.applicationType,
      attemptedAt: error.created_at?.toISOString() || '',
      formData: error.formData,
      user: error.userName ? {
        name: error.userName,
        phone: error.userPhone || '',
      } : undefined,
    }));

    return transformedErrors;
  } catch (error) {
    console.error("BDRIS application errors fetch error:", error);
    throw new Error("Failed to fetch BDRIS application errors");
  }
}