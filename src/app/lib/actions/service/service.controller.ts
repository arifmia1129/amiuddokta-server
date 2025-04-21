"use server";

// src/app/lib/actions/service/service.controller.ts
import { ZodError } from "zod";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceFilterSchema,
} from "./service.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createServiceService,
  deleteServiceService,
  getServiceByIdService,
  getServicesService,
  updateServiceService,
} from "./service.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get services (admin only)
export async function getServices(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
        message: "You do not have permission to access this resource",
        status: 403,
      };
    }

    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      is_active: params.is_active,
      is_featured: params.is_featured,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = serviceFilterSchema.parse(queryParams);

    // Get services
    const result = await getServicesService(validatedParams);

    return {
      success: true,
      message: "Services retrieved successfully",
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

    console.error("Error getting services:", error);
    return {
      success: false,
      message: "Failed to retrieve services",
      status: 500,
    };
  }
}

// Get service by ID
export async function getServiceById(params: {
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

    const serviceId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this service",
        status: 403,
      };
    }

    const service = await getServiceByIdService(serviceId);

    if (!service) {
      return {
        success: false,
        message: "Service not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Service retrieved successfully",
      data: service,
    };
  } catch (error) {
    console.error("Error getting service:", error);
    return {
      success: false,
      message: "Failed to retrieve service",
      status: 500,
    };
  }
}

// Create service (admin only)
export async function createService(data: {
  name: string;
  category_id: number;
  slug: string;
  short_description?: string;
  description?: string;
  icon?: string;
  featured_image?: string;
  price?: number;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
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
        message: "You do not have permission to create services",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = createServiceSchema.parse(data);

    // Create service
    const service = await createServiceService(validatedData);

    return {
      success: true,
      message: "Service created successfully",
      data: service,
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

    console.error("Error creating service:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create service",
      status: 500,
    };
  }
}

// Update service
export async function updateService(params: {
  id: string | number;
  data: {
    name?: string;
    category_id?: number;
    short_description?: string;
    description?: string;
    icon?: string;
    featured_image?: string;
    price?: number;
    is_featured?: boolean;
    is_active?: boolean;
    sort_order?: number;
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

    const serviceId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this service",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateServiceSchema.parse(params.data);

    // Update service
    const service = await updateServiceService(serviceId, validatedData);

    if (!service) {
      return {
        success: false,
        message: "Service not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Service updated successfully",
      data: service,
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

    console.error("Error updating service:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update service",
      status: 500,
    };
  }
}

// Delete service
export async function deleteService(params: {
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

    const serviceId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this service",
        status: 403,
      };
    }

    // Delete service
    await deleteServiceService(serviceId);

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting service:", error);
    return {
      success: false,
      message: "Failed to delete service",
      status: 500,
    };
  }
}
