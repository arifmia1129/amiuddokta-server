"use server";

// src/app/lib/actions/feedback/feedback.controller.ts
import { ZodError } from "zod";
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  feedbackFilterSchema,
} from "./feedback.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createFeedbackService,
  deleteFeedbackService,
  getFeedbackByIdService,
  getFeedbacksService,
  updateFeedbackService,
} from "./feedback.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get feedbacks (admin only)
export async function getFeedbacks(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      is_featured: params.is_featured,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = feedbackFilterSchema.parse(queryParams);

    // Get feedbacks
    const result = await getFeedbacksService(validatedParams);

    return {
      success: true,
      message: "Feedbacks retrieved successfully",
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

    console.error("Error getting feedbacks:", error);
    return {
      success: false,
      message: "Failed to retrieve feedbacks",
      status: 500,
    };
  }
}

// Get feedback by ID
export async function getFeedbackById(params: {
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

    const feedbackId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this feedback",
        status: 403,
      };
    }

    const feedback = await getFeedbackByIdService(feedbackId);

    if (!feedback) {
      return {
        success: false,
        message: "Feedback not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback,
    };
  } catch (error) {
    console.error("Error getting feedback:", error);
    return {
      success: false,
      message: "Failed to retrieve feedback",
      status: 500,
    };
  }
}

// Create feedback (admin only)
export async function createFeedback(data: {
  name: string;
  designation?: string;
  company?: string;
  profile_image?: string;
  stars: number;
  feedback: string;
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
        message: "You do not have permission to create feedbacks",
        status: 403,
      };
    }
    data.is_featured = data.is_featured ? true : false;
    data.stars = Number(data.stars);

    // Validate request data
    const validatedData = createFeedbackSchema.parse(data);

    // Create feedback
    const feedback = await createFeedbackService(validatedData);

    return {
      success: true,
      message: "Feedback created successfully",
      data: feedback,
      status: 201,
    };
  } catch (error: any) {
    console.log(error);
    if (error instanceof ZodError) {
      return {
        success: false,
        message: `Validation error: ${(error as any)?.errors?.[0]?.message}`,
        data: error.format(),
        status: 400,
      };
    }

    console.error("Error creating feedback:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create feedback",
      status: 500,
    };
  }
}

// Update feedback
export async function updateFeedback(params: {
  id: string | number;
  data: {
    name?: string;
    designation?: string;
    company?: string;
    profile_image?: string;
    stars?: number;
    feedback?: string;
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

    const feedbackId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this feedback",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateFeedbackSchema.parse(params.data);

    console.log(validatedData);

    // Update feedback
    const feedback = await updateFeedbackService(feedbackId, validatedData);

    if (!feedback) {
      return {
        success: false,
        message: "Feedback not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Feedback updated successfully",
      data: feedback,
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

    console.error("Error updating feedback:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update feedback",
      status: 500,
    };
  }
}

// Delete feedback
export async function deleteFeedback(params: {
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

    const feedbackId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this feedback",
        status: 403,
      };
    }

    // Delete feedback
    await deleteFeedbackService(feedbackId);

    return {
      success: true,
      message: "Feedback deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return {
      success: false,
      message: "Failed to delete feedback",
      status: 500,
    };
  }
}
