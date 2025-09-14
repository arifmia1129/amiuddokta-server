import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for auth routes, public assets, and API routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check for valid session
  const sessionToken = request.cookies.get("session")?.value;
  
  if (!sessionToken) {
    console.log('🔒 Middleware: No session found, redirecting to login');
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Verify the session token is valid
  try {
    await decrypt(sessionToken);
    console.log('✅ Middleware: Valid session, allowing access to:', pathname);
    return NextResponse.next();
  } catch (error) {
    console.log('❌ Middleware: Invalid session, redirecting to login');
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
