"use server";

// src/app/lib/actions/blogCategory/blogCategory.controller.ts
import { ZodError } from "zod";
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
  blogCategoryFilterSchema,
} from "./blogCategory.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createBlogCategoryService,
  deleteBlogCategoryService,
  getBlogCategoryByIdService,
  getBlogCategoriesService,
  updateBlogCategoryService,
  getBlogCategoryBySlugService,
} from "./blogCategory.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get blog categories (admin only)
export async function getBlogCategories(params: {
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
    const validatedParams = blogCategoryFilterSchema.parse(queryParams);

    // Get blog categories
    const result = await getBlogCategoriesService(validatedParams);

    return {
      success: true,
      message: "Blog categories retrieved successfully",
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

    console.error("Error getting blog categories:", error);
    return {
      success: false,
      message: "Failed to retrieve blog categories",
      status: 500,
    };
  }
}

// Get blog category by ID
export async function getBlogCategoryById(params: {
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
        message: "You do not have permission to access this blog category",
        status: 403,
      };
    }

    const category = await getBlogCategoryByIdService(categoryId);

    if (!category) {
      return {
        success: false,
        message: "Blog category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Blog category retrieved successfully",
      data: category,
    };
  } catch (error) {
    console.error("Error getting blog category:", error);
    return {
      success: false,
      message: "Failed to retrieve blog category",
      status: 500,
    };
  }
}

// Create blog category (admin only)
export async function createBlogCategory(data: {
  name: string;
  slug: string;
  description?: string;
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
        message: "You do not have permission to create blog categories",
        status: 403,
      };
    }
    data.is_active = data.is_active ? true : false;

    // Validate request data
    const validatedData = createBlogCategorySchema.parse(data);

    // Create blog category
    const category = await createBlogCategoryService(validatedData);

    return {
      success: true,
      message: "Blog category created successfully",
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

    console.error("Error creating blog category:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create blog category",
      status: 500,
    };
  }
}

// Update blog category
export async function updateBlogCategory(params: {
  id: string | number;
  data: {
    name?: string;
    description?: string;
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
        message: "You do not have permission to update this blog category",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateBlogCategorySchema.parse(params.data);

    // Update blog category
    const category = await updateBlogCategoryService(categoryId, validatedData);

    if (!category) {
      return {
        success: false,
        message: "Blog category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Blog category updated successfully",
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

    console.error("Error updating blog category:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update blog category",
      status: 500,
    };
  }
}

// Delete blog category
export async function deleteBlogCategory(params: {
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
        message: "You do not have permission to delete this blog category",
        status: 403,
      };
    }

    // Delete blog category
    await deleteBlogCategoryService(categoryId);

    return {
      success: true,
      message: "Blog category deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return {
      success: false,
      message: "Failed to delete blog category",
      status: 500,
    };
  }
}

export async function getBlogCategoryBySlug(params: {
  slug: string;
}): Promise<ActionResponse> {
  try {
    const categoryWithPosts = await getBlogCategoryBySlugService(params.slug);

    if (!categoryWithPosts) {
      return {
        success: false,
        message: "Blog category not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Blog category and associated posts retrieved successfully",
      data: categoryWithPosts,
    };
  } catch (error) {
    console.error("Error getting blog category by slug:", error);
    return {
      success: false,
      message: "Failed to retrieve blog category and associated posts",
      status: 500,
    };
  }
}
