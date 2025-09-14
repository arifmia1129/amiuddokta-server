"use server";

import { db } from "@/db";
import { users, bdrisApplications, bdrisApplicationErrors } from "@/db/schema";
import { eq, count, and, sql, desc, gte, lte } from "drizzle-orm";

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  failedApplications: number;
  registeredUsers: number;
  activeUsers: number;
  totalEntrepreneurs: number;
  recentApplications: Array<{
    id: string;
    applicationId: string;
    applicationType: string;
    submittedAt: Date;
    userName: string;
    userPhone: string;
    additionalInfo?: any;
  }>;
  applicationsByType: {
    birth_registration: number;
    death_registration: number;
    birth_correction: number;
    death_correction: number;
  };
  monthlyStats: Array<{
    month: string;
    applications: number;
    errors: number;
  }>;
  errorStats: {
    total: number;
    unresolved: number;
    resolved: number;
    byType: {
      submission_failed: number;
      validation_error: number;
      server_error: number;
      parsing_error: number;
    };
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total applications count
    const [totalApplicationsResult] = await db
      .select({ count: count() })
      .from(bdrisApplications);

    // Get application counts by success/failure
    const [totalErrors] = await db
      .select({ count: count() })
      .from(bdrisApplicationErrors);
    
    const approvedApplications = totalApplicationsResult.count;
    const failedApplications = totalErrors.count;
    
    // For "pending" - in BDRIS context, we don't track status, so this would be 0
    // or you could define it differently based on your business logic
    const pendingApplications = 0;

    // Get user statistics
    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.status, "active"));

    const [entrepreneursResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "entrepreneur"));

    // Get recent applications with user info
    const recentApplications = await db
      .select({
        id: bdrisApplications.id,
        applicationId: bdrisApplications.applicationId,
        applicationType: bdrisApplications.applicationType,
        submittedAt: bdrisApplications.submittedAt,
        userName: users.name,
        userPhone: users.phone,
        additionalInfo: bdrisApplications.additionalInfo,
      })
      .from(bdrisApplications)
      .leftJoin(users, eq(bdrisApplications.userId, users.id))
      .orderBy(desc(bdrisApplications.submittedAt))
      .limit(10);

    // Get applications by type
    const applicationsByTypeResult = await db
      .select({
        applicationType: bdrisApplications.applicationType,
        count: count(),
      })
      .from(bdrisApplications)
      .groupBy(bdrisApplications.applicationType);

    const applicationsByType = {
      birth_registration: 0,
      death_registration: 0,
      birth_correction: 0,
      death_correction: 0,
    };

    applicationsByTypeResult.forEach((item) => {
      if (item.applicationType) {
        applicationsByType[item.applicationType] = item.count;
      }
    });

    // Get monthly statistics for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${bdrisApplications.submittedAt})`,
        count: count(),
      })
      .from(bdrisApplications)
      .where(gte(bdrisApplications.submittedAt, sixMonthsAgo))
      .groupBy(sql`DATE_TRUNC('month', ${bdrisApplications.submittedAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${bdrisApplications.submittedAt})`);

    const monthlyErrors = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${bdrisApplicationErrors.created_at})`,
        count: count(),
      })
      .from(bdrisApplicationErrors)
      .where(gte(bdrisApplicationErrors.created_at, sixMonthsAgo))
      .groupBy(sql`DATE_TRUNC('month', ${bdrisApplicationErrors.created_at})`)
      .orderBy(sql`DATE_TRUNC('month', ${bdrisApplicationErrors.created_at})`);

    // Combine monthly stats
    const monthlyStatsMap = new Map();
    
    monthlyApplications.forEach((item) => {
      const monthKey = new Date(item.month).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyStatsMap.set(monthKey, { applications: item.count, errors: 0 });
    });

    monthlyErrors.forEach((item) => {
      const monthKey = new Date(item.month).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      const existing = monthlyStatsMap.get(monthKey) || { applications: 0, errors: 0 };
      existing.errors = item.count;
      monthlyStatsMap.set(monthKey, existing);
    });

    const monthlyStats = Array.from(monthlyStatsMap.entries()).map(([month, stats]) => ({
      month,
      ...stats,
    }));

    // Get error statistics
    const [unresolvedErrors] = await db
      .select({ count: count() })
      .from(bdrisApplicationErrors)
      .where(eq(bdrisApplicationErrors.isResolved, false));

    const [resolvedErrors] = await db
      .select({ count: count() })
      .from(bdrisApplicationErrors)
      .where(eq(bdrisApplicationErrors.isResolved, true));

    const errorsByTypeResult = await db
      .select({
        errorType: bdrisApplicationErrors.errorType,
        count: count(),
      })
      .from(bdrisApplicationErrors)
      .groupBy(bdrisApplicationErrors.errorType);

    const errorsByType = {
      submission_failed: 0,
      validation_error: 0,
      server_error: 0,
      parsing_error: 0,
    };

    errorsByTypeResult.forEach((item) => {
      if (item.errorType) {
        errorsByType[item.errorType] = item.count;
      }
    });

    return {
      totalApplications: totalApplicationsResult.count,
      pendingApplications,
      approvedApplications,
      failedApplications,
      registeredUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalEntrepreneurs: entrepreneursResult.count,
      recentApplications: recentApplications.map((app) => ({
        id: app.id.toString(),
        applicationId: app.applicationId,
        applicationType: app.applicationType || "",
        submittedAt: app.submittedAt,
        userName: app.userName || "Unknown",
        userPhone: app.userPhone || "Unknown",
        additionalInfo: app.additionalInfo,
      })),
      applicationsByType,
      monthlyStats,
      errorStats: {
        total: totalErrors.count,
        unresolved: unresolvedErrors.count,
        resolved: resolvedErrors.count,
        byType: errorsByType,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentApplicationsWithDetails(limit: number = 5) {
  try {
    return await db
      .select({
        id: bdrisApplications.id,
        applicationId: bdrisApplications.applicationId,
        applicationType: bdrisApplications.applicationType,
        submittedAt: bdrisApplications.submittedAt,
        additionalInfo: bdrisApplications.additionalInfo,
        formData: bdrisApplications.formData,
        user: {
          name: users.name,
          phone: users.phone,
          centerName: users.center_name,
        },
      })
      .from(bdrisApplications)
      .leftJoin(users, eq(bdrisApplications.userId, users.id))
      .orderBy(desc(bdrisApplications.submittedAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    throw new Error("Failed to fetch recent applications");
  }
}