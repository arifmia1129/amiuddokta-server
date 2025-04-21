"use server";

import { ZodError } from "zod";
import {
  createTeamSchema,
  updateTeamSchema,
  teamFilterSchema,
} from "./team.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createTeamMemberService,
  deleteTeamMemberService,
  getTeamMemberByIdService,
  getTeamMembersService,
  updateTeamMemberService,
} from "./team.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get team members (public + admin)
export async function getTeamMembers(params: {
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
      sortBy: params.sortBy || "order",
      sortOrder: (params.sortOrder as "asc" | "desc") || "asc",
    };

    // Validate query parameters
    const validatedParams = teamFilterSchema.parse(queryParams);

    // Get team members
    const result = await getTeamMembersService(validatedParams);

    return {
      success: true,
      message: "Team members retrieved successfully",
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

    console.error("Error getting team members:", error);
    return {
      success: false,
      message: "Failed to retrieve team members",
      status: 500,
    };
  }
}

// Get team member by ID
export async function getTeamMemberById(params: {
  id: string | number;
}): Promise<ActionResponse> {
  try {
    const teamId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
    const teamMember = await getTeamMemberByIdService(teamId);

    if (!teamMember) {
      return {
        success: false,
        message: "Team member not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Team member retrieved successfully",
      data: teamMember,
    };
  } catch (error) {
    console.error("Error getting team member:", error);
    return {
      success: false,
      message: "Failed to retrieve team member",
      status: 500,
    };
  }
}

// Create team member (admin only)
export async function createTeamMember(data: {
  name: string;
  position: string;
  bio?: string;
  profile_image?: string;
  order?: number;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    instagram?: string;
  };
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
        message: "You do not have permission to create team members",
        status: 403,
      };
    }

    // Convert order to number if it's a string
    if (typeof data.order === "string") {
      data.order = parseInt(data.order, 10);
    }

    // Set default value for is_featured
    data.is_featured = data.is_featured ? true : false;

    // Validate request data
    const validatedData = createTeamSchema.parse(data);

    // Create team member
    const teamMember = await createTeamMemberService(validatedData);

    return {
      success: true,
      message: "Team member created successfully",
      data: teamMember,
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

    console.error("Error creating team member:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create team member",
      status: 500,
    };
  }
}

// Update team member
export async function updateTeamMember(params: {
  id: string | number;
  data: {
    name?: string;
    position?: string;
    bio?: string;
    profile_image?: string;
    order?: number;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
      instagram?: string;
    };
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

    const teamId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this team member",
        status: 403,
      };
    }

    // Convert order to number if it's a string
    if (typeof params.data.order === "string") {
      params.data.order = parseInt(params.data.order, 10);
    }

    // Validate request data
    const validatedData = updateTeamSchema.parse(params.data);

    // Update team member
    const teamMember = await updateTeamMemberService(teamId, validatedData);

    if (!teamMember) {
      return {
        success: false,
        message: "Team member not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Team member updated successfully",
      data: teamMember,
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

    console.error("Error updating team member:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update team member",
      status: 500,
    };
  }
}

// Delete team member
export async function deleteTeamMember(params: {
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

    const teamId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this team member",
        status: 403,
      };
    }

    // Delete team member
    await deleteTeamMemberService(teamId);

    return {
      success: true,
      message: "Team member deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting team member:", error);
    return {
      success: false,
      message: "Failed to delete team member",
      status: 500,
    };
  }
}
