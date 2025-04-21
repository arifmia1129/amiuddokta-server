"use server";

// src/app/lib/actions/blog/blog.controller.ts
import { ZodError } from "zod";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogPostFilterSchema,
} from "./blogPosts.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createBlogPostService,
  deleteBlogPostService,
  getBlogPostByIdService,
  getBlogPostsService,
  updateBlogPostService,
} from "./blogPosts.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get blog posts (admin only)
export async function getBlogPosts(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_published?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category_id?: number; // Add category_id as an optional parameter
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      is_published: params.is_published,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
      category_id: params.category_id, // Include category_id in queryParams
    };

    // Validate query parameters
    const validatedParams = blogPostFilterSchema.parse(queryParams);

    // Get blog posts
    const result = await getBlogPostsService(validatedParams);

    return {
      success: true,
      message: "Blog posts retrieved successfully",
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

    console.error("Error getting blog posts:", error);
    return {
      success: false,
      message: "Failed to retrieve blog posts",
      status: 500,
    };
  }
}

// Get blog post by ID
export async function getBlogPostById(params: {
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

    const postId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this blog post",
        status: 403,
      };
    }

    const post = await getBlogPostByIdService(postId);

    if (!post) {
      return {
        success: false,
        message: "Blog post not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Blog post retrieved successfully",
      data: post,
    };
  } catch (error) {
    console.error("Error getting blog post:", error);
    return {
      success: false,
      message: "Failed to retrieve blog post",
      status: 500,
    };
  }
}

// Create blog post (admin only)
export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author_id: number;
  category_id: number;
  is_published?: boolean;
  published_at?: Date;
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
        message: "You do not have permission to create blog posts",
        status: 403,
      };
    }
    data.is_published = data.is_published ? true : false;

    // Validate request data
    const validatedData = createBlogPostSchema.parse(data);

    // Create blog post
    const post = await createBlogPostService(validatedData);

    return {
      success: true,
      message: "Blog post created successfully",
      data: post,
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

    console.error("Error creating blog post:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create blog post",
      status: 500,
    };
  }
}

// Update blog post
export async function updateBlogPost(params: {
  id: string | number;
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    featured_image?: string;
    author_id?: number;
    category_id?: number;
    is_published?: boolean;
    published_at?: string;
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

    const postId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this blog post",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateBlogPostSchema.parse(params.data);

    console.log(validatedData);

    // Update blog post
    const post = await updateBlogPostService(postId, validatedData);

    if (!post) {
      return {
        success: false,
        message: "Blog post not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Blog post updated successfully",
      data: post,
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

    console.error("Error updating blog post:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update blog post",
      status: 500,
    };
  }
}

// Delete blog post
export async function deleteBlogPost(params: {
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

    const postId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this blog post",
        status: 403,
      };
    }

    // Delete blog post
    await deleteBlogPostService(postId);

    return {
      success: true,
      message: "Blog post deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return {
      success: false,
      message: "Failed to delete blog post",
      status: 500,
    };
  }
}
