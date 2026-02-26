import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
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

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/my-account/:path*',
    '/my-account',
    '/login',
    '/register'
  ],
};
