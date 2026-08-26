import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get("auth_token")?.value;

  const isProtectedRoute = pathname.startsWith("/notes");
  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  // No token
  if (!token) {
    // Protected route → login
    if (isProtectedRoute) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    // Public/auth routes allowed
    return NextResponse.next();
  }

  // Token exists → verify it
  const userId = await verifyToken(token);

  // Invalid/expired token
  if (!userId) {
    const response = isProtectedRoute
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();

    response.cookies.delete("auth_token");

    return response;
  }

  // User is authenticated
  // Don't allow authenticated users to login/register again
  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL("/notes/new", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/notes/:path*",
    "/login",
    "/register",
  ],
};