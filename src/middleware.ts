import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Maintenance mode is ON unless MAINTENANCE_MODE=false is set in the environment.
// To bring the site back: set MAINTENANCE_MODE=false (e.g. in Vercel env vars) and redeploy.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE !== "false";

// Paths that keep working during maintenance (admin panel, admin login, APIs/webhooks).
const MAINTENANCE_BYPASS = ["/maintenance", "/admin", "/login", "/api", "/print"];

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Protection for Admin Routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Already Logged In? Redirect away from login/register
    if ((path === '/login' || path === '/register') && !!token) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/my-account', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Paths that don't require pre-authentication check (we handle them in middleware function)
        if (path === '/login' || path === '/register') return true;
        // Routes that require at least a session
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

const AUTH_PATHS = ["/admin", "/my-account", "/login", "/register"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const path = req.nextUrl.pathname;

  if (MAINTENANCE_MODE && !matches(path, MAINTENANCE_BYPASS)) {
    return NextResponse.redirect(new URL("/maintenance", req.url), 307);
  }

  if (!MAINTENANCE_MODE && path === "/maintenance") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (matches(path, AUTH_PATHS)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req, event);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every page except Next.js internals and static files (anything with a file extension).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
