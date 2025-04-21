// src/app/lib/utils/api-response.utils.ts
import { NextResponse } from "next/server";

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

// Success response helper
export function successResponse<T>(
  data: T,
  message = "Operation successful",
  meta?: ApiResponse["meta"],
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    },
    { status },
  );
}

// Error response helper
export function errorResponse(
  message = "Operation failed",
  error?: string,
  status = 400,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(error && { error }),
    },
    { status },
  );
}

// Not found response
export function notFoundResponse(message = "Resource not found"): NextResponse {
  return errorResponse(message, undefined, 404);
}

// Unauthorized response
export function unauthorizedResponse(
  message = "Unauthorized access",
): NextResponse {
  return errorResponse(message, undefined, 401);
}

// Forbidden response
export function forbiddenResponse(message = "Access forbidden"): NextResponse {
  return errorResponse(message, undefined, 403);
}

// Validation error response
export function validationErrorResponse(
  errors: Record<string, string[]>,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      errors,
    },
    { status: 422 },
  );
}
