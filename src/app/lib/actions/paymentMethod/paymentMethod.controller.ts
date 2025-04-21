"use server";

import { authenticateAndAuthorize, sendResponse } from "@/utils/functions";
import {
  createPaymentMethodService,
  retrievePaymentMethodListService,
  updatePaymentMethodService,
  deletePaymentMethodService,
  searchPaymentMethodService,
  retrievePaymentMethodByIdService,
} from "./paymentMethod.service";
import { paymentMethods } from "@/db/schema";

export const createPaymentMethodController = async (data: any) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin");
    if (authRes) return authRes;

    await createPaymentMethodService(data);
    return sendResponse(true, 201, "Payment method created successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrievePaymentMethodListController = async (pagination: any) => {
  try {
    const result = await retrievePaymentMethodListService(pagination);
    return sendResponse(
      true,
      200,
      "Payment methods retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const retrievePaymentMethodByIdController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await retrievePaymentMethodByIdService(id);

    if (!result) {
      return sendResponse(false, 404, "Payment Method not found");
    }

    return sendResponse(
      true,
      200,
      "Payment Method retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(
      false,
      500,
      error.message || "Failed to retrieve payment method",
    );
  }
};

export const updatePaymentMethodController = async (
  id: number,
  data: Partial<typeof paymentMethods>,
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin");
    if (authRes) return authRes;

    const result = await updatePaymentMethodService(id, data);
    return sendResponse(
      true,
      200,
      "Payment method updated successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const deletePaymentMethodController = async (id: number) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin");
    if (authRes) return authRes;

    await deletePaymentMethodService(id);
    return sendResponse(true, 200, "Payment method deleted successfully", null);
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};

export const searchPaymentMethodController = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const authRes = await authenticateAndAuthorize("super_admin", "admin");
    if (authRes) return authRes;

    const result = await searchPaymentMethodService(searchParams, pagination);
    return sendResponse(
      true,
      200,
      "Payment methods search results retrieved successfully",
      result,
    );
  } catch (error: any) {
    return sendResponse(false, 500, error.message);
  }
};
