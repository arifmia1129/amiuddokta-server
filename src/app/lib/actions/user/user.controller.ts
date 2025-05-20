"use server";

import { ZodError } from "zod";
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  userFilterSchema,
  changePinSchema,
} from "./user.validation";
import {
  setAuthCookie,
  clearAuthCookie,
  getCurrentUserSession,
} from "@/app/lib/utils/auth.utils";
import {
  changePinService,
  createUserService,
  deleteUserService,
  getUserByPhoneService,
  getUserByIdService,
  getUsersService,
  loginService,
  updateUserService,
} from "./user.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get users (admin only)
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
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
      status: params.status as any,
      role: params.role as any,
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = userFilterSchema.parse(queryParams);

    // Get users
    const result = await getUsersService(validatedParams);

    return {
      success: true,
      message: "Users retrieved successfully",
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

    return {
      success: false,
      message: "Failed to retrieve users",
      status: 500,
    };
  }
}

// Get user by ID
export async function getUserById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const userId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    const user = await getUserByIdService(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return {
      success: false,
      message: "Failed to retrieve user",
      status: 500,
    };
  }
}

// Create user (admin only)
export async function createUser(data: {
  name: string;
  phone: string;
  pin: string;
  role?: string;
  status?: string;
  center_name?: string;
  center_address?: string;
  division?: number;
  district?: number;
  upazila?: number;
  union?: number;
  ward?: any;
}): Promise<ActionResponse> {
  try {
    // Get the current session
    const session = await getCurrentUserSession();
    if (!session && data?.role === "admin") {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    // Check authorization
    if (session && !["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to create users",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = createUserSchema.parse(data);

    // Check if phone already exists
    const existingUser = await getUserByPhoneService(validatedData.phone);
    if (existingUser) {
      return {
        success: false,
        message: "Phone number already in use",
        status: 400,
      };
    }

    // Create user
    const user = await createUserService(validatedData);

    return {
      success: true,
      message: "User created successfully",
      data: user,
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

    return {
      success: false,
      message: error?.detail || "Failed to create user",
      status: 500,
    };
  }
}

// Update user
export async function updateUser(params: {
  id: string | number;
  data: {
    name?: string;
    phone?: string;
    profile_image?: string;
    role?: string;
    status?: string;
    center_name?: string;
    center_address?: string;
    division?: number;
    district?: number;
    upazila?: number;
    union?: number;
  };
}): Promise<ActionResponse> {
  let validatedData;
  try {
    if (params?.data?.role !== "super_admin") {
      // Validate request data
      const validatedData = updateUserSchema.parse(params.data);

      // Check if phone is being changed and if it already exists
      if (validatedData.phone) {
        const existingUser = await getUserByPhoneService(validatedData.phone);
        if (existingUser && existingUser.id !== params.id) {
          return {
            success: false,
            message: "Phone number already in use",
            status: 400,
          };
        }
      }
    }

    // Update user
    const user = await updateUserService(
      Number(params.id),
      params?.data?.role === "super_admin"
        ? (params?.data as any)
        : validatedData,
    );

    if (!user) {
      return {
        success: false,
        message: "User not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "User updated successfully",
      data: user,
    };
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation error",
        data: error.format(),
        status: 400,
      };
    }

    console.error("Error updating user:", error);
    return {
      success: false,
      message: "Failed to update user",
      status: 500,
    };
  }
}

// Delete user (admin only)
export async function deleteUser(params: {
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

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete users",
        status: 403,
      };
    }

    const userId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user exists
    const user = await getUserByIdService(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
        status: 404,
      };
    }

    // Super admin can't be deleted
    if (user.role === "super_admin") {
      return {
        success: false,
        message: "Super admin cannot be deleted",
        status: 403,
      };
    }

    // Delete user
    await deleteUserService(userId);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "Failed to delete user",
      status: 500,
    };
  }
}

// Authentication methods

// Login
export async function login(data: {
  phone: string;
  pin: string;
}): Promise<ActionResponse> {
  try {
    // Validate data
    const validatedData = loginUserSchema.parse(data);

    // Attempt login
    const result = await loginService(validatedData);

    if (!result) {
      return {
        success: false,
        message: "Invalid phone number or PIN",
        status: 401,
      };
    }

    // Set auth cookie
    setAuthCookie(result.token);

    return {
      success: true,
      message: "Login successful",
      data: result,
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

    console.error("Error during login:", error);
    return {
      success: false,
      message: "Login failed",
      status: 500,
    };
  }
}

// Logout
export async function logout(): Promise<ActionResponse> {
  // Clear auth cookie
  clearAuthCookie();

  return {
    success: true,
    message: "Logout successful",
  };
}

// Get current user profile
export async function getCurrentUser(): Promise<ActionResponse> {
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

    // Get user details
    const user = await getUserByIdService(session.id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return {
      success: false,
      message: "Failed to retrieve user profile",
      status: 500,
    };
  }
}

// Change PIN
export async function changePin(data: {
  currentPin: string;
  newPin: string;
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

    // Validate data
    const validatedData = changePinSchema.parse(data);

    // Change PIN
    const result = await changePinService(session.id, validatedData);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        status: 400,
      };
    }

    return {
      success: true,
      message: "PIN changed successfully",
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

    console.error("Error changing PIN:", error);
    return {
      success: false,
      message: "Failed to change PIN",
      status: 500,
    };
  }
}
