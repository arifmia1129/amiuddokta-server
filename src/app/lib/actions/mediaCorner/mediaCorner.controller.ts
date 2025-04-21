"use server";

import { ZodError } from "zod";
import {
  createMediaCornerSchema,
  updateMediaCornerSchema,
  mediaCornerFilterSchema,
} from "./mediaCorner.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createMediaCornerItemService,
  deleteMediaCornerItemService,
  getMediaCornerItemByIdService,
  getMediaCornerItemsService,
  updateMediaCornerItemService,
} from "./mediaCorner.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get media corner items (public + admin)
export async function getMediaCornerItems(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: "image" | "video";
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      is_featured: params.is_featured,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "asc",
      type: (params.type as "image" | "video") || undefined,
    };
    // Validate query parameters
    const validatedParams = mediaCornerFilterSchema.parse(queryParams);

    // Get media corner items
    const result = await getMediaCornerItemsService(validatedParams);

    return {
      success: true,
      message: "Media corner items retrieved successfully",
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

    console.error("Error getting media corner items:", error);
    return {
      success: false,
      message: "Failed to retrieve media corner items",
      status: 500,
    };
  }
}

// Get media corner item by ID
export async function getMediaCornerItemById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const mediaId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
    const mediaItem = await getMediaCornerItemByIdService(mediaId);

    if (!mediaItem) {
      return {
        success: false,
        message: "Media corner item not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Media corner item retrieved successfully",
      data: mediaItem,
    };
  } catch (error) {
    console.error("Error getting media corner item:", error);
    return {
      success: false,
      message: "Failed to retrieve media corner item",
      status: 500,
    };
  }
}

// Create media corner item (admin only)
export async function createMediaCornerItem(data: {
  title: string;
  description?: string;
  type: "image" | "video";
  link: string;
  thumbnail?: string;
  is_featured?: boolean;
}): Promise<ActionResponse> {
  try {
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
        message: "You do not have permission to create media corner items",
        status: 403,
      };
    }

    // Set default value for is_featured
    data.is_featured = data.is_featured ? true : false;

    // Validate request data
    const validatedData = createMediaCornerSchema.parse(data);

    // Create media corner item
    const mediaItem = await createMediaCornerItemService(validatedData);

    return {
      success: true,
      message: "Media corner item created successfully",
      data: mediaItem,
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

    console.error("Error creating media corner item:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create media corner item",
      status: 500,
    };
  }
}

// Update media corner item
export async function updateMediaCornerItem(params: {
  id: string | number;
  data: {
    title?: string;
    description?: string;
    type?: "image" | "video";
    link?: string;
    thumbnail?: string;
    is_featured?: boolean;
  };
}): Promise<ActionResponse> {
  try {
    // Get the current session
    const session = await getCurrentUserSession();
    if (!session) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    const mediaId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this media corner item",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateMediaCornerSchema.parse(params.data);

    // Update media corner item
    const mediaItem = await updateMediaCornerItemService(
      mediaId,
      validatedData,
    );

    if (!mediaItem) {
      return {
        success: false,
        message: "Media corner item not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Media corner item updated successfully",
      data: mediaItem,
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

    console.error("Error updating media corner item:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update media corner item",
      status: 500,
    };
  }
}

// Delete media corner item
export async function deleteMediaCornerItem(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    // Get the current session
    const session = await getCurrentUserSession();
    if (!session) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    const mediaId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this media corner item",
        status: 403,
      };
    }

    // Delete media corner item
    await deleteMediaCornerItemService(mediaId);

    return {
      success: true,
      message: "Media corner item deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting media corner item:", error);
    return {
      success: false,
      message: "Failed to delete media corner item",
      status: 500,
    };
  }
}
