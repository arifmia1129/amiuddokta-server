// src/app/lib/actions/media/media.controller.ts
"use server";

import { ZodError } from "zod";
import { updateMediaSchema, mediaFilterSchema } from "./media.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  getMediaService,
  getMediaByIdService,
  createMediaService,
  updateMediaService,
  deleteMediaService,
  uploadFileService,
} from "./media.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get media items (with filtering)
export async function getMedia(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  file_type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  user_id?: number;
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

    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      status: params.status as any,
      file_type: params.file_type,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
      user_id: params.user_id,
    };

    // For non-admin users, restrict to their own media
    if (!["super_admin", "admin"].includes(session.role)) {
      queryParams.user_id = session.id;
    }

    // Validate query parameters
    const validatedParams = mediaFilterSchema.parse(queryParams);

    // Get media items
    const result = await getMediaService(validatedParams);

    return {
      success: true,
      message: "Media items retrieved successfully",
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

    console.error("Error getting media items:", error);
    return {
      success: false,
      message: "Failed to retrieve media items",
      status: 500,
    };
  }
}

// Get media by ID
export async function getMediaById(params: {
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

    // Get media item
    const mediaItem = await getMediaByIdService(mediaId);

    if (!mediaItem) {
      return {
        success: false,
        message: "Media not found",
        status: 404,
      };
    }

    // Check if user has access to this media item
    if (
      mediaItem.user_id !== session.id &&
      !["super_admin", "admin"].includes(session.role)
    ) {
      return {
        success: false,
        message: "You do not have permission to access this media",
        status: 403,
      };
    }

    return {
      success: true,
      message: "Media retrieved successfully",
      data: mediaItem,
    };
  } catch (error) {
    console.error("Error getting media:", error);
    return {
      success: false,
      message: "Failed to retrieve media",
      status: 500,
    };
  }
}

// Upload media
export async function uploadMedia(formData: FormData): Promise<ActionResponse> {
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

    // Extract file and other data from FormData
    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        message: "No file provided",
        status: 400,
      };
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: "File size must be less than 10MB",
        status: 400,
      };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "File type must be .png, .jpg, .jpeg, or .gif",
        status: 400,
      };
    }

    // Extract other fields from formData
    const title = (formData.get("title") as string) || file.name;
    const alt_text = (formData.get("alt_text") as string) || title;
    const description = (formData.get("description") as string) || "";
    const status =
      (formData.get("status") as "active" | "inactive" | "archived") ||
      "active";

    // Validate media data
    const mediaData = {
      title,
      alt_text,
      description,
      status,
      user_id: session.id,
    };

    // Upload file and create media record
    const result = await uploadFileService(file, mediaData);

    return {
      success: true,
      message: "Media uploaded successfully",
      data: result,
      status: 201,
    };
  } catch (error) {
    console.error("Error uploading media:", error);
    return {
      success: false,
      message: "Failed to upload media",
      status: 500,
    };
  }
}

// Update media
export async function updateMedia(params: {
  id: string | number;
  data: {
    title?: string;
    alt_text?: string;
    description?: string;
    status?: "active" | "inactive" | "archived";
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

    // Check if media exists
    const mediaItem = await getMediaByIdService(mediaId);
    if (!mediaItem) {
      return {
        success: false,
        message: "Media not found",
        status: 404,
      };
    }

    // Check if user has permission to update this media
    if (
      mediaItem.user_id !== session.id &&
      !["super_admin", "admin"].includes(session.role)
    ) {
      return {
        success: false,
        message: "You do not have permission to update this media",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateMediaSchema.parse(params.data);

    // Update media
    const updatedMedia = await updateMediaService(mediaId, validatedData);

    return {
      success: true,
      message: "Media updated successfully",
      data: updatedMedia,
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

    console.error("Error updating media:", error);
    return {
      success: false,
      message: "Failed to update media",
      status: 500,
    };
  }
}

// Delete media
export async function deleteMedia(params: {
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

    // Check if media exists
    const mediaItem = await getMediaByIdService(mediaId);
    if (!mediaItem) {
      return {
        success: false,
        message: "Media not found",
        status: 404,
      };
    }

    // Check if user has permission to delete this media
    if (
      mediaItem.user_id !== session.id &&
      !["super_admin", "admin"].includes(session.role)
    ) {
      return {
        success: false,
        message: "You do not have permission to delete this media",
        status: 403,
      };
    }

    // Delete media
    await deleteMediaService(mediaId);

    return {
      success: true,
      message: "Media deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      message: "Failed to delete media",
      status: 500,
    };
  }
}
