import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/saved-trips") ||
    pathname.startsWith("/reviews");

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/messages/:path*",
    "/reviews/:path*",
    "/saved-trips/:path*",
    "/auth/:path*",
  ],
};
