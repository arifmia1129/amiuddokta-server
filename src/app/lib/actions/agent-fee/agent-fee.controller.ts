"use server";

import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";

import {
  createAgentFeeService,
  deleteAgentFeeService,
  retrieveAgentFeeByIdService,
  retrieveAgentFeeListService,
  retrieveAgentFeeSearchService,
  updateAgentFeeService,
} from "./agent-fee.service";

export const createAgentFeeController = async (data: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    data.agent_id = Number(data.agent_id);
    data.sub_agent_id = data.sub_agent_id ? Number(data.sub_agent_id) : null;
    data.fee_per_application = Number(data.fee_per_application);

    await createAgentFeeService(data);
    return sendResponse(true, 201, "Agent fee created successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveAgentFeeListController = async (pagination: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrieveAgentFeeListService(pagination);
    return sendResponse(
      true,
      200,
      "Agent fee list retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const updateAgentFeeController = async (data: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    await updateAgentFeeService(data);
    return sendResponse(true, 200, "Agent fee updated successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const deleteAgentFeeController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    await deleteAgentFeeService(id);
    return sendResponse(true, 200, "Agent fee deleted successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const searchAgentFeeController = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrieveAgentFeeSearchService(
      searchParams,
      pagination,
    );
    return sendResponse(
      true,
      200,
      "Agent fee search results retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrieveAgentFeeByIdController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const fee = await retrieveAgentFeeByIdService(id);
    return sendResponse(true, 200, "Agent fee retrieved successfully", fee);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};
