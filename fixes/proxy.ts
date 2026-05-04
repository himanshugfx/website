/**
 * proxy.ts  (renamed from middleware.ts for Next.js 16+)
 *
 * The "middleware" file convention is deprecated in Next.js 16.
 * This file replaces middleware.ts — rename/delete the old one after adding this.
 *
 * Docs: https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin route protection ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Only allow admin role
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ── My-account route protection ─────────────────────────────────────────
  if (pathname.startsWith('/my-account')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/my-account/:path*'],
}
