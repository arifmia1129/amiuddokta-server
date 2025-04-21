"use server";

import { ZodError } from "zod";
import {
  createContactFormSchema,
  updateContactFormSchema,
  contactFormFilterSchema,
} from "./contactForm.validation";
import { getCurrentUserSession } from "@/app/lib/utils/auth.utils";
import {
  createContactFormService,
  deleteContactFormService,
  getContactFormByIdService,
  getContactFormsService,
  updateContactFormService,
} from "./contactForm.service";

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Get contact form submissions (admin only)
export async function getContactForms(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActionResponse> {
  try {
    // Prepare query parameters with defaults
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
      sortBy: params.sortBy || "created_at",
      sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    };

    // Validate query parameters
    const validatedParams = contactFormFilterSchema.parse(queryParams);

    // Get contact form submissions
    const result = await getContactFormsService(validatedParams);

    return {
      success: true,
      message: "Contact form submissions retrieved successfully",
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

    console.error("Error getting contact form submissions:", error);
    return {
      success: false,
      message: "Failed to retrieve contact form submissions",
      status: 500,
    };
  }
}

// Get contact form submission by ID
export async function getContactFormById(params: {
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

    const contactFormId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check if user is trying to access their own profile or if they're admin
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to access this contact form submission",
        status: 403,
      };
    }

    const contactForm = await getContactFormByIdService(contactFormId);

    if (!contactForm) {
      return {
        success: false,
        message: "Contact form submission not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Contact form submission retrieved successfully",
      data: contactForm,
    };
  } catch (error) {
    console.error("Error getting contact form submission:", error);
    return {
      success: false,
      message: "Failed to retrieve contact form submission",
      status: 500,
    };
  }
}

// Create contact form submission (admin only)
export async function createContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ActionResponse> {
  try {
    

    // Validate request data
    const validatedData = createContactFormSchema.parse(data);

    // Create contact form submission
    const contactForm = await createContactFormService(validatedData);

    return {
      success: true,
      message: "Contact form submission created successfully",
      data: contactForm,
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

    console.error("Error creating contact form submission:", error);
    return {
      success: false,
      message: error?.detail || "Failed to create contact form submission",
      status: 500,
    };
  }
}

// Update contact form submission
export async function updateContactForm(params: {
  id: string | number;
  data: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
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

    const contactFormId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to update this contact form submission",
        status: 403,
      };
    }

    // Validate request data
    const validatedData = updateContactFormSchema.parse(params.data);

    console.log(validatedData);

    // Update contact form submission
    const contactForm = await updateContactFormService(contactFormId, validatedData);

    if (!contactForm) {
      return {
        success: false,
        message: "Contact form submission not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Contact form submission updated successfully",
      data: contactForm,
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

    console.error("Error updating contact form submission:", error);
    return {
      success: false,
      message: error?.detail || "Failed to update contact form submission",
      status: 500,
    };
  }
}

// Delete contact form submission
export async function deleteContactForm(params: {
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

    const contactFormId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;

    // Check authorization
    if (!["super_admin", "admin"].includes(session.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this contact form submission",
        status: 403,
      };
    }

    // Delete contact form submission
    await deleteContactFormService(contactFormId);

    return {
      success: true,
      message: "Contact form submission deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting contact form submission:", error);
    return {
      success: false,
      message: "Failed to delete contact form submission",
      status: 500,
    };
  }
}
