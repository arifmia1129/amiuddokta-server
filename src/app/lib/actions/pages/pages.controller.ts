"use server";

// src/app/lib/actions/pages/pages.controller.ts
import { ZodError } from "zod";
import {
  createPageSchema,
  updatePageSchema,
  pageFilterSchema,
} from "./pages.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createPageService,
  deletePageService,
  getPageByIdService,
  getPagesService,
  updatePageService,
} from "./pages.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get pages (admin only)
export async function getPages(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_published?: boolean;
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
      is_published: params.is_published,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = pageFilterSchema.parse(queryParams);

    // Get pages
    const result = await getPagesService(validatedParams);

    return {
      success: true,
      message: "Pages retrieved successfully",
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

    console.error("Error getting pages:", error);
    return {
      success: false,
      message: "Failed to retrieve pages",
      status: 500,
    };
  }
}

// Get page by ID
export async function getPageById(params: {
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

    const pageId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this page",
        status: 403,
      };
    }

    const page = await getPageByIdService(pageId);

    if (!page) {
      return {
        success: false,
        message: "Page not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Page retrieved successfully",
      data: page,
    };
  } catch (error) {
    console.error("Error getting page:", error);
    return {
      success: false,
      message: "Failed to retrieve page",
      status: 500,
    };
  }
}

// Create page (admin only)
export async function createPage(data: {
  title: string;
  slug: string;
  content?: string;
  layout?: string;
  sections?: any;
  is_published?: boolean;
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
        message: "You do not have permission to create pages",
        status: 403,
      };
    }
    data.is_published = data.is_published ? true : false;

    // Validate request data
    const validatedData = createPageSchema.parse(data);

    // Create page
    const page = await createPageService(validatedData);

    return {
      success: true,
      message: "Page created successfully",
      data: page,
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

    console.error("Error creating page:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create page",
      status: 500,
    };
  }
}

// Update page
export async function updatePage(params: {
  id: string | number;
  data: {
    title?: string;
    content?: string;
    layout?: string;
    sections?: any;
    is_published?: boolean;
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

    const pageId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this page",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updatePageSchema.parse(params.data);

    console.log(validatedData);

    // Update page
    const page = await updatePageService(pageId, validatedData);

    if (!page) {
      return {
        success: false,
        message: "Page not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Page updated successfully",
      data: page,
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

    console.error("Error updating page:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update page",
      status: 500,
    };
  }
}

// Delete page
export async function deletePage(params: {
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

    const pageId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this page",
        status: 403,
      };
    }

    // Delete page
    await deletePageService(pageId);

    return {
      success: true,
      message: "Page deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting page:", error);
    return {
      success: false,
      message: "Failed to delete page",
      status: 500,
    };
  }
}
