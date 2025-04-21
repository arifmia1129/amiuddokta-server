"use server";

import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";

import {
  createApplicationService,
  retrieveAdminReportService,
  retrieveApplicationDetailsService,
  retrieveApplicationListService,
  retrieveApplicationSearchService,
  retrieveMyApplicationListService,
  updateApplicationService,
} from "./application.service";

export const createApplicationController = async (data: any) => {
  try {
    const { user_id, type, ...others } = data;
    await createApplicationService({
      user_id,
      type,
      data: { ...others },
    });
    return sendResponse(true, 201, "Application created successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveApplicationListController = async (pagination: any) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "admin",
      "agent",
      "sub_agent",
    );
    if (authRes) return authRes;

    const result = await retrieveApplicationListService(pagination);
    return sendResponse(
      true,
      200,
      "Application list retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveMyApplicationListController = async (
  pagination: any,
  userId: number,
  status?: string,
) => {
  try {
    const result = await retrieveMyApplicationListService(
      userId,
      pagination,
      status as any,
    );

    return sendResponse(
      true,
      200,
      "User application list retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const updateApplicationController = async (data: any) => {
  try {
    const authRes = (await authenticateAndAuthorize(
      "super_admin",
      "admin",
    )) as any;
    if (authRes) return authRes;

    await updateApplicationService(data);
    return sendResponse(true, 200, "Application updated successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const searchApplicationController = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "admin",
      "agent",
      "sub_agent",
    );
    if (authRes) return authRes;

    const result = await retrieveApplicationSearchService(
      searchParams,
      pagination,
    );
    return sendResponse(
      true,
      200,
      "Application search results retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveApplicationDetailsController = async (
  applicationId: number,
) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "admin",
      "agent",
      "sub_agent",
    );
    if (authRes) return authRes;

    const applicationDetails =
      await retrieveApplicationDetailsService(applicationId);

    return sendResponse(
      true,
      200,
      "Application details retrieved successfully",
      applicationDetails,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveAdminReportController = async (params: any) => {
  try {
    const result = await retrieveAdminReportService(params);
    return sendResponse(
      true,
      200,
      "Admin report retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(
      false,
      500,
      error.message || "Failed to retrieve admin report",
    );
  }
};
