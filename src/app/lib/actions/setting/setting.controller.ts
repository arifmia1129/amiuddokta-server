"use server";

import { auth, sendResponse } from "@/utils/functions";
import {
  createSettingService,
  deleteSettingByIdService,
  retrieveSettingByIdService,
  retrieveSettingByModuleService,
  retrieveSettingListService,
  updateSettingByIdService,
} from "./setting.service";
import { getCurrentUserSession } from "../../utils/auth.utils";

export const createSettingController = async (data: any) => {
  // Get the current session
  const session = await getCurrentUserSession();
  if (!session) {
    return {
      success: false,
      message: "Authentication required",
      status: 401,
    };
  }

  // Check authorization
  if (!["super_admin", "admin"].includes(session.role)) {
    return {
      success: false,
      message: "You do not have permission to access this resource",
      status: 403,
    };
  }

  data.created_by = session.id;

  const res = await createSettingService(data);
  return sendResponse(
    true,
    200,
    "Successfully created setting information",
    null,
  );
};

export const retrieveSettingListController = async (
  pagination: any,
): Promise<any> => {
  const res = await retrieveSettingListService(pagination);

  return sendResponse(
    true,
    200,
    "Successfully retrieved setting information",
    res,
  );
};

export const retrieveSettingByIdController = async (id: number) => {
  const res = await retrieveSettingByIdService(id);

  return sendResponse(true, 200, "Successfully retrieved setting", res);
};
export const retrieveSettingByModuleController = async (module: string) => {
  const res = await retrieveSettingByModuleService(module);

  return sendResponse(true, 200, "Successfully retrieved setting", res);
};

export const updateSettingByIdController = async (data: any) => {
  const session = await getCurrentUserSession();
  if (!session) {
    return {
      success: false,
      message: "Authentication required",
      status: 401,
    };
  }

  // Check authorization
  if (!["super_admin", "admin"].includes(session.role)) {
    return {
      success: false,
      message: "You do not have permission to access this resource",
      status: 403,
    };
  }
  await updateSettingByIdService(data);

  return sendResponse(true, 200, "Successfully updated setting", null);
};

export const deleteSettingByIdController = async (id: number) => {
  const authRes = await auth("super_admin", "admin");

  if (authRes.statusCode >= 200 && authRes.statusCode < 300) {
    const res = (await deleteSettingByIdService(id)) as any;

    return sendResponse(true, 200, "Successfully deleted setting", null);
  }
};
