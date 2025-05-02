// src/app/lib/utils/auth.utils.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Environment variables should be properly setup in your project
const JWT_SECRET =
  process.env.JWT_SECRET || "!@#ami-uddokta-secret-key-ausk@#$";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Hash PIN
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

// Compare PIN with hashed PIN
export async function comparePin(
  pin: string,
  hashedPin: string,
): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin);
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(token: string): void {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  cookies().set("auth_token", token, { expires, httpOnly: true });
}

// Get auth cookie
export function getAuthCookie(): string | undefined {
  return cookies().get("auth_token")?.value;
}

// Clear auth cookie
export function clearAuthCookie(): void {
  cookies().delete("auth_token");
}

// Get current user from token
export function getCurrentUserSession(): {
  id: number;
  role: string;
  phone: string;
} | null {
  const token = getAuthCookie();
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return { id: decoded.id, role: decoded.role, phone: decoded.phone };
}
