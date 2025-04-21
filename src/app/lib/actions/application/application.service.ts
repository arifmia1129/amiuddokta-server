"use server";

import { db } from "@/db";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { applications, users } from "@/db/schema";
import { ApplicationData, ApplicationType } from "@/db/schema"; // Import the types from your schema
import { retrieveAgentFeeByTypeService } from "../agent-fee/agent-fee.service";
import { retrieveSettingByModuleService } from "../setting/setting.service";
import { ApiError } from "next/dist/server/api-utils";
import { retrieveSettingByModuleController } from "../setting/setting.controller";
import sendEmail from "../../utils/sendMailer";

// Helper to validate application data based on type
const validateApplicationData = (data: ApplicationData) => {
  switch (data.type) {
    case "NEW_BMET":
      if (
        !data.fullName ||
        !data.passportIssueDate ||
        !data.passportExpireDate
      ) {
        throw new ApiError(
          400,
          "Missing required fields for NEW_BMET application",
        );
      }
      break;
    case "PDO_REGISTRATION":
      if (!data.ttc || !data.country || !data.profileImage) {
        throw new ApiError(400, "Missing required fields for PDO_REGISTRATION");
      }
      break;
    // Add validation for other types as needed
  }
};

export const createApplicationService = async (input: {
  user_id: number;
  type: ApplicationType;
  data: ApplicationData;
}) => {
  try {
    const retrieveResult =
      await retrieveSettingByModuleController("notify_emails");

    // Extract email addresses into an array
    const emailAddresses =
      retrieveResult?.data?.[0]?.setting_fields
        ?.filter((field: any) => field?.name?.toLowerCase()?.includes("email"))
        ?.map((field: any) => field?.value) || [];

    // Fetch the user
    const userArr = await db
      .select()
      .from(users)
      .where(eq(users.id, input.user_id));

    const user = userArr[0];
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Validate application data
    validateApplicationData(input.data);

    // Fetch fee for the application type
    const fee = await retrieveAgentFeeByTypeService(
      user.id,
      user.role as any,
      input.type,
    );

    const defaultFee = (await retrieveSettingByModuleService("fees")) as any;
    const applicationFee =
      fee?.fee_per_application ||
      defaultFee?.[0]?.setting_fields?.find(
        (f: any) => f.name.toLowerCase() === input.type.toLowerCase(),
      )?.value;

    if (!applicationFee) {
      throw new ApiError(404, "Application fee not configured for this type");
    }

    // Check if user has sufficient balance
    const userBalance = parseFloat(user.balance || "0");
    const feeAmount = parseFloat(applicationFee);

    if (userBalance < feeAmount) {
      throw new ApiError(400, "Insufficient balance to create application");
    }

    // Deduct balance
    await db
      .update(users)
      .set({ balance: (userBalance - feeAmount).toFixed(2) })
      .where(eq(users.id, user.id));

    // Create the application
    const result = await db
      .insert(applications)
      .values({
        user_id: input.user_id,
        type: input.type,
        data: input.data,
        fee_applied: feeAmount,
      } as any)
      .returning();
    // Prepare dynamic email content
    if (
      emailAddresses &&
      Array.isArray(emailAddresses) &&
      emailAddresses.length
    ) {
      const subject = `A new ${input.type.replace(/_/g, " ")} application has been created by ${user.name} (${user.email}).`;
      const message = `
        A new ${input.type.replace(/_/g, " ")} application has been created by ${user.name} (${user.email}).
        Application Details: https://admin.myseba24.com/admin/applications/details/${result[0]?.id}
      `;

      // Send email notification to all email addresses
      await sendEmail(emailAddresses, subject, message);
    }
    return result[0];
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to create application");
  }
};

export const retrieveApplicationListService = async (pagination: {
  page: number;
  pageSize: number;
}) => {
  try {
    const applicationsList = await db
      .select({
        id: applications.id,
        userId: applications.user_id,
        type: applications.type,
        status: applications.status,
        feeApplied: applications.fee_applied,
        data: applications.data,
        createdAt: applications.created_at,
        userName: users.name,
        userEmail: users.email,
      })
      .from(applications)
      .innerJoin(users, eq(applications.user_id, users.id))
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(applications.id));

    const totalCount = await db.select({ count: count() }).from(applications);

    return {
      data: applicationsList,
      totalLength: totalCount[0].count,
    };
  } catch (error: any) {
    throw new Error("Error retrieving application list");
  }
};

export const retrieveMyApplicationListService = async (
  userId: number,
  pagination: { page: number; pageSize: number },
  status?: "pending" | "approved" | "rejected",
) => {
  try {
    const whereClause = status
      ? and(eq(applications.user_id, userId), eq(applications.status, status))
      : eq(applications.user_id, userId);

    const myApplicationsList = await db
      .select({
        id: applications.id,
        type: applications.type,
        status: applications.status,
        feeApplied: applications.fee_applied,
        data: applications.data,
        createdAt: applications.created_at,
      })
      .from(applications)
      .where(whereClause)
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(applications.id));

    const totalCount = await db
      .select({ count: count() })
      .from(applications)
      .where(whereClause);

    return {
      data: myApplicationsList,
      totalLength: totalCount[0].count,
    };
  } catch (error: any) {
    throw new Error("Error retrieving user-specific application list");
  }
};

interface ApplicationUpdate {
  id: number;
  status?: "pending" | "approved" | "rejected";
  data?: Partial<ApplicationData>;
  action_by?: number;
}

export const updateApplicationService = async (data: ApplicationUpdate) => {
  try {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.status) updateData.status = data.status;
    if (data.data) updateData.data = data.data;
    if (data.action_by) updateData.action_by = data.action_by;

    return await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, data.id));
  } catch (error: any) {
    throw new Error("Failed to update application");
  }
};

export const retrieveApplicationSearchService = async (
  searchParams: { keyword: string },
  pagination: { page: number; pageSize: number },
) => {
  try {
    const { keyword } = searchParams;
    const keywordPattern = `%${keyword}%`;

    // Updated search conditions to look within the JSON data field
    const searchConditions = sql`
      LOWER(${users.name}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${applications.type}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${applications.data}->>'fullName') LIKE LOWER(${keywordPattern}) OR
      LOWER(${applications.data}->>'passportNo') LIKE LOWER(${keywordPattern})
    `;

    const results = await db
      .select({
        id: applications.id,
        userId: applications.user_id,
        type: applications.type,
        status: applications.status,
        feeApplied: applications.fee_applied,
        data: applications.data,
        createdAt: applications.created_at,
        userName: users.name,
        userEmail: users.email,
      })
      .from(applications)
      .innerJoin(users, eq(applications.user_id, users.id))
      .where(searchConditions)
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(applications.id));

    const totalCount = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(users, eq(applications.user_id, users.id))
      .where(searchConditions);

    return {
      data: results,
      totalLength: totalCount[0].count,
    };
  } catch (error: any) {
    throw new Error("Search failed");
  }
};

export const retrieveApplicationDetailsService = async (
  applicationId: number,
) => {
  try {
    const applicationDetails = await db
      .select({
        id: applications.id,
        userId: applications.user_id,
        type: applications.type,
        status: applications.status,
        feeApplied: applications.fee_applied,
        data: applications.data,
        createdAt: applications.created_at,
        actionBy: applications.action_by,
        userName: users.name,
        userEmail: users.email,
      })
      .from(applications)
      .innerJoin(users, eq(applications.user_id, users.id))
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (applicationDetails.length === 0) {
      throw new ApiError(404, "Application not found");
    }

    return applicationDetails[0];
  } catch (error: any) {
    throw new Error("Error retrieving application details");
  }
};

interface AdminReportParams {
  adminId?: number;
  status?: "approved" | "rejected" | "pending";
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

export const retrieveAdminReportService = async ({
  adminId,
  status,
  startDate,
  endDate,
  page,
  pageSize,
}: AdminReportParams) => {
  const whereClause = and(
    adminId ? eq(applications.action_by, adminId) : undefined,
    status ? eq(applications.status, status) : undefined,
    startDate ? gte(applications.updated_at, new Date(startDate)) : undefined,
    endDate ? lte(applications.updated_at, new Date(endDate)) : undefined,
  );

  const adminReport = await db
    .select({
      id: applications.id,
      userId: applications.user_id,
      type: applications.type,
      status: applications.status,
      feeApplied: applications.fee_applied,
      actionBy: applications.action_by,
      createdAt: applications.created_at,
      updatedAt: applications.updated_at,
      adminName: users.name,
    })
    .from(applications)
    .innerJoin(users, eq(applications.action_by, users.id))
    .where(whereClause)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .orderBy(desc(applications.updated_at));

  const totalCount = await db
    .select({ count: count() })
    .from(applications)
    .where(whereClause);

  // Calculate date ranges for summaries
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setMonth(now.getMonth() - 1);

  // Build where clauses for different time periods
  const todayWhereClause = and(
    adminId ? eq(applications.action_by, adminId) : undefined,
    gte(applications.updated_at, todayStart),
  );

  const weekWhereClause = and(
    adminId ? eq(applications.action_by, adminId) : undefined,
    gte(applications.updated_at, weekStart),
  );

  const monthWhereClause = and(
    adminId ? eq(applications.action_by, adminId) : undefined,
    gte(applications.updated_at, monthStart),
  );

  // Get totals for different time periods
  const todayTotal = await db
    .select({
      total: sql<number>`COALESCE(SUM(${applications.fee_applied}), 0)`,
    })
    .from(applications)
    .where(todayWhereClause);

  const weeklyTotal = await db
    .select({
      total: sql<number>`COALESCE(SUM(${applications.fee_applied}), 0)`,
    })
    .from(applications)
    .where(weekWhereClause);

  const monthlyTotal = await db
    .select({
      total: sql<number>`COALESCE(SUM(${applications.fee_applied}), 0)`,
    })
    .from(applications)
    .where(monthWhereClause);

  return {
    data: adminReport,
    totalLength: totalCount[0].count,
    summary: {
      today: Number(todayTotal[0].total),
      weekly: Number(weeklyTotal[0].total),
      monthly: Number(monthlyTotal[0].total),
    },
  };
};
