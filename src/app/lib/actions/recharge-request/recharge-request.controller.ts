"use server";

import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";
import {
  createRechargeRequestService,
  retrieveRechargeRequestListService,
  updateRechargeRequestStatusService,
  retrieveRechargeRequestSearchService,
  retrieveRechargeRequestListByUserIdService,
} from "./recharge-request.service";

import { getSessionController } from "../auth/auth.controller";

export const createRechargeRequestController = async (data: any) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "agent",
      "sub_agent",
    );
    if (authRes) return authRes;

    const user = await getSessionController();

    if (user.id) {
      data.user_id = user.id;
    }

    await createRechargeRequestService(data);
    return sendResponse(
      true,
      201,
      "Recharge request created successfully",
      null,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveRechargeRequestListController = async (
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrieveRechargeRequestListService(pagination);
    return sendResponse(
      true,
      200,
      "Recharge request list retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveRechargeRequestListByUserIdController = async (
  userId: number,
  pagination: any,
) => {
  try {
    const result = await retrieveRechargeRequestListByUserIdService(
      userId,
      pagination,
    );
    return sendResponse(
      true,
      200,
      "Recharge request list by userId retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const updateRechargeRequestStatusController = async (
  id: number,
  status: "approved" | "rejected",
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin");
    if (authRes) return authRes;

    await updateRechargeRequestStatusService(id, status);
    return sendResponse(
      true,
      200,
      "Recharge request status updated successfully",
      null,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const searchRechargeRequestController = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrieveRechargeRequestSearchService(
      searchParams,
      pagination,
    );
    return sendResponse(
      true,
      200,
      "Recharge request search results retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};
