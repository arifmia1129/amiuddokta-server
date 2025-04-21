"use server";

// src/app/lib/actions/serviceCategory/serviceCategory.controller.ts
import { ZodError } from "zod";
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  serviceCategoryFilterSchema,
} from "./serviceCategory.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createServiceCategoryService,
  deleteServiceCategoryService,
  getServiceCategoryByIdService,
  getServiceCategoriesService,
  updateServiceCategoryService,
  getServiceCategoryBySlugService,
} from "./serviceCategory.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get service categories (admin only)
export async function getServiceCategories(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      is_active: params.is_active,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = serviceCategoryFilterSchema.parse(queryParams);

    // Get service categories
    const result = await getServiceCategoriesService(validatedParams);

    return {
      success: true,
      message: "Service categories retrieved successfully",
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

    console.error("Error getting service categories:", error);
    return {
      success: false,
      message: "Failed to retrieve service categories",
      status: 500,
    };
  }
}

// Get service category by ID
export async function getServiceCategoryById(params: {
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

    const categoryId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this service category",
        status: 403,
      };
    }

    const category = await getServiceCategoryByIdService(categoryId);

    if (!category) {
      return {
        success: false,
        message: "Service category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Service category retrieved successfully",
      data: category,
    };
  } catch (error) {
    console.error("Error getting service category:", error);
    return {
      success: false,
      message: "Failed to retrieve service category",
      status: 500,
    };
  }
}
export async function getServiceCategoryBySlug(params: {
  slug: string;
}): Promise<ActionResponse> {
  try {
    const categoryWithServices = await getServiceCategoryBySlugService(
      params.slug,
    );

    if (!categoryWithServices) {
      return {
        success: false,
        message: "Service category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message:
        "Service category and associated services retrieved successfully",
      data: categoryWithServices,
    };
  } catch (error) {
    console.error("Error getting service category by slug:", error);
    return {
      success: false,
      message: "Failed to retrieve service category and associated services",
      status: 500,
    };
  }
}

// Create service category (admin only)
export async function createServiceCategory(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
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
        message: "You do not have permission to create service categories",
        status: 403,
      };
    }
    data.is_active = data.is_active ? true : false;

    // Validate request data
    const validatedData = createServiceCategorySchema.parse(data);

    // Create service category
    const category = await createServiceCategoryService(validatedData);

    return {
      success: true,
      message: "Service category created successfully",
      data: category,
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

    console.error("Error creating service category:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create service category",
      status: 500,
    };
  }
}

// Update service category
export async function updateServiceCategory(params: {
  id: string | number;
  data: {
    name?: string;
    description?: string;
    icon?: string;
    sort_order?: number;
    is_active?: boolean;
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

    const categoryId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this service category",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateServiceCategorySchema.parse(params.data);

    // Update service category
    const category = await updateServiceCategoryService(
      categoryId,
      validatedData,
    );

    if (!category) {
      return {
        success: false,
        message: "Service category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Service category updated successfully",
      data: category,
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

    console.error("Error updating service category:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update service category",
      status: 500,
    };
  }
}

// Delete service category
export async function deleteServiceCategory(params: {
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

    const categoryId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this service category",
        status: 403,
      };
    }

    // Delete service category
    await deleteServiceCategoryService(categoryId);

    return {
      success: true,
      message: "Service category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting service category:", error);
    return {
      success: false,
      message: "Failed to delete service category",
      status: 500,
    };
  }
}
