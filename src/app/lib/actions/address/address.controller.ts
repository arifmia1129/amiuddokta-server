"use server";

import { ZodError } from "zod";
import {
  createAddressSchema,
  updateAddressSchema,
  addressFilterSchema,
} from "./address.validation";
import {
  createAddressService,
  deleteAddressService,
  getAddressByIdService,
  getAddressesService,
  updateAddressService,
} from "./address.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get addresses (admin only)
export async function getAddresses(params: {
  page?: number;
  limit?: number;
  ward_id?: number;
  user_id?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ward_id: params.ward_id,
      user_id: params.user_id,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = addressFilterSchema.parse(queryParams);

    // Get addresses
    const result = await getAddressesService(validatedParams);

    return {
      success: true,
      message: "Addresses retrieved successfully",
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation error",
        data: error.format(),
        status: 400,
      };
    }

    return {
      success: false,
      message: "Failed to retrieve addresses",
      status: 500,
    };
  }
}

// Get address by ID
export async function getAddressById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const addressId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    const address = await getAddressByIdService(addressId);

    if (!address) {
      return {
        success: false,
        message: "Address not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Address retrieved successfully",
      data: address,
    };
  } catch (error) {
    console.error("Error getting address:", error);
    return {
      success: false,
      message: "Failed to retrieve address",
      status: 500,
    };
  }
}

// Create address (admin only)
export async function createAddress(data: {
  user_id: number;
  ward_id: number;
  post_office_bn: string;
  post_office_en: string;
  village_bn: string;
  village_en: string;
}): Promise<ActionResponse> {
  try {
    // Validate request data
    const validatedData = createAddressSchema.parse(data);

    // Create address
    const address = await createAddressService(validatedData);

    return {
      success: true,
      message: "Address created successfully",
      data: address,
      status: 201,
    };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: `Validation error: ${(error as any)?.errors?.[0]?.message}`,
        data: error.format(),
        status: 400,
      };
    }

    console.error("Error creating address:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create address",
      status: 500,
    };
  }
}

// Update address
export async function updateAddress(params: {
  id: string | number;
  data: {
    user_id?: number;
    ward_id?: number;
    post_office_bn?: string;
    post_office_en?: string;
    village_bn?: string;
    village_en?: string;
  };
}): Promise<ActionResponse> {
  try {
    // Validate request data
    const validatedData = updateAddressSchema.parse(params.data);

    // Update address
    const address = await updateAddressService(
      Number(params.id),
      validatedData,
    );

    if (!address) {
      return {
        success: false,
        message: "Address not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Address updated successfully",
      data: address,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation error",
        data: error.format(),
        status: 400,
      };
    }

    console.error("Error updating address:", error);
    return {
      success: false,
      message: "Failed to update address",
      status: 500,
    };
  }
}

// Delete address (admin only)
export async function deleteAddress(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const addressId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if address exists
    const address = await getAddressByIdService(addressId);
    if (!address) {
      return {
        success: false,
        message: "Address not found",
        status: 404,
      };
    }

    // Delete address
    await deleteAddressService(addressId);

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    return {
      success: false,
      message: "Failed to delete address",
      status: 500,
    };
  }
}
