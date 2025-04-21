"use server";

// src/app/lib/actions/publicService/publicService.controller.ts
import { ZodError } from "zod";
import {
  createPublicServiceSchema,
  updatePublicServiceSchema,
  publicServiceFilterSchema,
} from "./publicService.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createPublicServiceService,
  deletePublicServiceService,
  getPublicServiceByIdService,
  getPublicServicesService,
  updatePublicServiceService,
} from "./publicService.service";

type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

export async function getPublicServices(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: "new_services" | "notices" | "important_links";
  status?: "active" | "inactive";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActionResponse> {
  try {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      category: params.category,
      status: params.status,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    const validatedParams = publicServiceFilterSchema.parse(queryParams);

    const result = await getPublicServicesService(validatedParams);

    return {
      success: true,
      message: "Public services retrieved successfully",
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

    console.error("Error getting public services:", error);
    return {
      success: false,
      message: "Failed to retrieve public services",
      status: 500,
    };
  }
}

export async function getPublicServiceById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const serviceId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    const service = await getPublicServiceByIdService(serviceId);

    if (!service) {
      return {
        success: false,
        message: "Public service not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Public service retrieved successfully",
      data: service,
    };
  } catch (error) {
    console.error("Error getting public service:", error);
    return {
      success: false,
      message: "Failed to retrieve public service",
      status: 500,
    };
  }
}

export async function createPublicService(data: {
  title: string;
  slug: string;
  short_description?: string;
  content: string;
  external_link?: string;
  has_modal?: boolean | string;
  category: "new_services" | "notices" | "important_links";
  status?: "active" | "inactive";
}): Promise<ActionResponse> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to create public services",
        status: 403,
      };
    }

    data.status = data.status ? data.status : "active";
    data.has_modal = data.has_modal === "true" ? true : false;

    const validatedData = createPublicServiceSchema.parse(data);

    const service = await createPublicServiceService(validatedData);

    return {
      success: true,
      message: "Public service created successfully",
      data: service,
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

    console.error("Error creating public service:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create public service",
      status: 500,
    };
  }
}

export async function updatePublicService(params: {
  id: string | number;
  data: {
    title?: string;
    short_description?: string;
    content?: string;
    external_link?: string;
    has_modal?: boolean | string;
    category?: "new_services" | "notices" | "important_links";
    status?: "active" | "inactive";
  };
}): Promise<ActionResponse> {
  try {
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

    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this public service",
        status: 403,
      };
    }

    params.data.status = params.data.status ? params.data.status : "active";
    params.data.has_modal = params.data.has_modal === "true" ? true : false;

    const validatedData = updatePublicServiceSchema.parse(params.data);

    const service = await updatePublicServiceService(serviceId, validatedData);

    if (!service) {
      return {
        success: false,
        message: "Public service not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Public service updated successfully",
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

    console.error("Error updating public service:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update public service",
      status: 500,
    };
  }
}

export async function deletePublicService(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
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

    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this public service",
        status: 403,
      };
    }

    await deletePublicServiceService(serviceId);

    return {
      success: true,
      message: "Public service deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting public service:", error);
    return {
      success: false,
      message: "Failed to delete public service",
      status: 500,
    };
  }
}
