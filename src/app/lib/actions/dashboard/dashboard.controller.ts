"use server";

import { getDashboardStats, getRecentApplicationsWithDetails } from "./dashboard.service";
import { getSessionController } from "../auth/auth.controller";

export async function getDashboardStatsController() {
  try {
    // Check authentication
    const session = await getSessionController();
    if (!session) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Check if user has permission (admin or super_admin)
    if (!["admin", "super_admin"].includes(session.role)) {
      return {
        success: false,
        statusCode: 403,
        message: "Insufficient permissions to access dashboard statistics",
      };
    }

    const stats = await getDashboardStats();

    return {
      success: true,
      statusCode: 200,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Dashboard stats controller error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve dashboard statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getRecentApplicationsController(limit: number = 5) {
  try {
    // Check authentication
    const session = await getSessionController();
    if (!session) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Check if user has permission
    if (!["admin", "super_admin"].includes(session.role)) {
      return {
        success: false,
        statusCode: 403,
        message: "Insufficient permissions to access applications data",
      };
    }

    const applications = await getRecentApplicationsWithDetails(limit);

    return {
      success: true,
      statusCode: 200,
      message: "Recent applications retrieved successfully",
      data: applications,
    };
  } catch (error) {
    console.error("Recent applications controller error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve recent applications",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}