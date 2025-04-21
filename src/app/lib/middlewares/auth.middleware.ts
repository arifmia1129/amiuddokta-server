// src/app/lib/middlewares/auth.middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/utils/auth.utils";
import {
  unauthorizedResponse,
  forbiddenResponse,
} from "@/app/lib/utils/api-response.utils";

export async function authenticateUser(
  request: NextRequest,
  response?: NextResponse,
): Promise<{ userId: number; role: string } | NextResponse> {
  // Get token from cookies or Authorization header
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : request.cookies.get("auth_token")?.value;

  if (!token) {
    return unauthorizedResponse("Authentication required");
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return unauthorizedResponse("Invalid or expired token");
  }

  return { userId: decoded.id, role: decoded.role };
}

// Check if user has required role
export function checkRole(
  userRole: string,
  allowedRoles: string[],
): NextResponse | true {
  if (!allowedRoles.includes(userRole)) {
    return forbiddenResponse(
      "You do not have permission to access this resource",
    );
  }

  return true;
}

// Middleware handler for protected routes that need specific roles
export async function protectedRoute(
  request: NextRequest,
  allowedRoles?: string[],
): Promise<{ userId: number; role: string } | NextResponse> {
  const authResult = await authenticateUser(request);

  if (authResult instanceof NextResponse) {
    return authResult; // This is an error response
  }

  // If roles specified, check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    const roleCheck = checkRole(authResult.role, allowedRoles);
    if (roleCheck instanceof NextResponse) {
      return roleCheck; // This is an error response
    }
  }

  return authResult;
}
