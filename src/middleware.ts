import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define paths that require authentication
  const isAdminPath = path.startsWith('/admin');

  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Debugging logs for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${path}`);
    console.log(`[Middleware] Token exists: ${!!token}`);
    if (token) console.log(`[Middleware] Role: ${token.role}`);
  }

  // 1. Protection for Admin Routes
  if (isAdminPath) {
    // If not logged in, redirect to login with callback
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }

    // If logged in but not admin, redirect to home
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Prevent authenticated users from accessing login/register pages
  if (path === '/login' || path === '/register') {
    if (token) {
      // If admin, go to dashboard, else go to account or home
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/my-account', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
