"use server";

import { ZodError } from "zod";
import {
  createCareersSchema,
  updateCareersSchema,
  careersFilterSchema,
} from "./careers.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createCareersItemService,
  deleteCareersItemService,
  getCareersItemByIdService,
  getCareersItemsService,
  updateCareersItemService,
} from "./careers.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get career items (public + admin)
export async function getCareersItems(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  job_type?:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "internship"
    | "remote"
    | undefined;
  job_status?: "open" | "closed" | "draft" | "expired" | "filled" | undefined;
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
      job_type: params.job_type || undefined,
      job_status: params.job_status || undefined,
    };
    // Validate query parameters
    const validatedParams = careersFilterSchema.parse(queryParams);

    // Get career items
    const result = await getCareersItemsService(validatedParams);

    return {
      success: true,
      message: "Career items retrieved successfully",
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

    console.error("Error getting career items:", error);
    return {
      success: false,
      message: "Failed to retrieve career items",
      status: 500,
    };
  }
}

// Get career item by ID
export async function getCareersItemById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const careerId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
    const careerItem = await getCareersItemByIdService(careerId);

    if (!careerItem) {
      return {
        success: false,
        message: "Career item not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Career item retrieved successfully",
      data: careerItem,
    };
  } catch (error) {
    console.error("Error getting career item:", error);
    return {
      success: false,
      message: "Failed to retrieve career item",
      status: 500,
    };
  }
}

// Create career item (admin only)
export async function createCareersItem(data: {
  title: string;
  company_name: string;
  location: string;
  description: string;
  responsibilities?: string;
  qualifications?: string;
  salary_range?: string;
  benefits?: string;
  featured_image?: string; // New field added
  job_status?: "open" | "closed" | "draft" | "expired" | "filled";
  job_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "freelance"
    | "internship"
    | "remote";
  experience_required?: number;
  education_level?: string;
  skills_required?: string;
  application_deadline?: string;
  is_featured?: boolean;
  contact_email: string;
  contact_phone?: string;
  posted_by?: number;
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
        message: "You do not have permission to create career items",
        status: 403,
      };
    }

    // Set default value for is_featured
    data.is_featured = data.is_featured ? true : false;
    data.posted_by = session.id;

    // Validate request data
    const validatedData = createCareersSchema.parse(data);

    // Create career item
    const careerItem = await createCareersItemService(validatedData);

    return {
      success: true,
      message: "Career item created successfully",
      data: careerItem,
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

    console.error("Error creating career item:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create career item",
      status: 500,
    };
  }
}

// Update career item
export async function updateCareersItem(params: {
  id: string | number;
  data: {
    title?: string;
    company_name?: string;
    location?: string;
    description?: string;
    responsibilities?: string;
    qualifications?: string;
    salary_range?: string;
    benefits?: string;
    featured_image?: string; // New field added
    job_status?: "open" | "closed" | "draft" | "expired" | "filled";
    job_type?:
      | "full_time"
      | "part_time"
      | "contract"
      | "freelance"
      | "internship"
      | "remote";
    experience_required?: number;
    education_level?: string;
    skills_required?: string;
    application_deadline?: string;
    is_featured?: boolean;
    contact_email?: string;
    contact_phone?: string;
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

    const careerId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    params.data.is_featured = params.data.is_featured ? true : false;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this career item",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateCareersSchema.parse(params.data);

    // Update career item
    const careerItem = await updateCareersItemService(careerId, validatedData);

    if (!careerItem) {
      return {
        success: false,
        message: "Career item not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Career item updated successfully",
      data: careerItem,
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

    console.error("Error updating career item:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update career item",
      status: 500,
    };
  }
}

// Delete career item
export async function deleteCareersItem(params: {
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

    const careerId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this career item",
        status: 403,
      };
    }

    // Delete career item
    await deleteCareersItemService(careerId);

    return {
      success: true,
      message: "Career item deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting career item:", error);
    return {
      success: false,
      message: "Failed to delete career item",
      status: 500,
    };
  }
}
