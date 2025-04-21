"use server";

import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";

import {
  createUserService,
  deleteUserByIdService,
  retrieveAdminListService,
  retrieveSubAgentsByAgentIdService,
  retrieveUserByIdService,
  retrieveUserListService,
  retrieveUserSearchService,
  updateUserByIdService,
} from "./user.service";

/**
 * Controller to create a new user.
 */
export const createUserController = async (data: any) => {
  console.log(data);
  try {
    if (!data?.isFromAdmin) {
      data.balance = 0;
      data.role = "agent";
    }

    await createUserService(data);
    return sendResponse(true, 201, "User created successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to retrieve a paginated list of users.
 */
export const retrieveUserListController = async (pagination: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrieveUserListService(pagination);
    return sendResponse(true, 200, "User list retrieved successfully", result);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveSubAgentsByAgentIdController = async (
  agentId: number,
  pagination: any,
) => {
  try {
    // Authorize the agent to access their sub-agents
    const authRes = await authenticateAndAuthorize("agent");
    if (authRes) return authRes;

    const result = await retrieveSubAgentsByAgentIdService(agentId, pagination);
    return sendResponse(
      true,
      200,
      "Sub-agent list retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to retrieve a user by ID.
 */
export const retrieveUserByIdController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "admin",
      "agent",
    );
    if (authRes) return authRes;

    const user = await retrieveUserByIdService(id);

    const { password, ...userInfo } = user || {};

    return sendResponse(true, 200, "User retrieved successfully", userInfo);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to update a user by ID.
 */
export const updateUserByIdController = async (data: any) => {
  try {
    await updateUserByIdService(data);
    return sendResponse(true, 200, "User updated successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to delete a user by ID.
 */
export const deleteUserByIdController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize(
      "super_admin",
      "admin",
      "agent",
    );
    if (authRes) return authRes;

    await deleteUserByIdService(id);
    return sendResponse(true, 200, "User deleted successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to search users with pagination.
 */
export const searchUserController = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize("manager", "admin");
    if (authRes) return authRes;

    const result = await retrieveUserSearchService(searchParams, pagination);
    return sendResponse(
      true,
      200,
      "User search results retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

/**
 * Controller to retrieve a paginated list of admins (excluding super admins).
 */
export const retrieveAdminListController = async (pagination: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin");
    if (authRes) return authRes;

    const result = await retrieveAdminListService(pagination);
    return sendResponse(true, 200, "Admin list retrieved successfully", result);
  } catch (error: any) {
    return sendResponse(
      false,
      500,
      error.message || "Failed to retrieve admin list",
    );
  }
};
