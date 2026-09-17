import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change_in_env";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("admin_token")?.value;

  // If already logged in and visiting /admin/login or /admin/register, redirect directly to /admin dashboard
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch (e) {
        // Token is invalid/expired, allow them to view login page
      }
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      // Verify token using jose for Edge compatibility
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
