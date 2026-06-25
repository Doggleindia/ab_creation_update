import { NextRequest, NextResponse } from "next/server";

// Decode a JWT payload (no signature verification — the signing secret lives
// only on the backend) and check it is well-formed and not expired. The real
// authorization check still happens server-side on every API call; this just
// stops obviously-stale/garbage cookies from passing the client-side gate.
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;
  const authenticated = isTokenValid(token);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard"];

  // Auth routes (login, register, etc)
  const authRoutes = ["/login", "/register"];

  // Check if user is accessing a protected route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!authenticated) {
      // Redirect to login and clear the stale/invalid cookie
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("token");
      return res;
    }
  }

  // Check if user is accessing auth routes with a valid token
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (authenticated) {
      // Redirect to dashboard if already logged in
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
