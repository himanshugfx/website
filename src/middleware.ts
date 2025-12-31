import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is an admin route
  if (path.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log(`Middleware: Accessing ${path}`);
    console.log(`Middleware: Token found: ${!!token}`);
    if (token) {
      console.log(`Middleware: User role: ${token.role}`);
    }

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    if (token.role !== 'admin') {
      console.log('Middleware: User is not admin, redirecting to home');
      // If not admin, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
