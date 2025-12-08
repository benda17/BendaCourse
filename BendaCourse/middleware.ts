import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Get JWT_SECRET directly in middleware (Edge runtime compatible)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  role: string
}

async function verifyTokenInMiddleware(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    // Extract our custom payload structure from jose's JWTPayload
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error('[Middleware verifyToken] Error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files and assets - MUST be first check
  // Explicitly check for icon.png and other static assets
  if (
    pathname === '/icon.png' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)$/i) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/')
  ) {
    // Return early without any processing for static files
    return NextResponse.next()
  }
  
  const token = request.cookies.get('token')?.value
  
  // Debug JWT_SECRET
  if (pathname === '/dashboard') {
    console.log(`[Middleware] JWT_SECRET available:`, !!JWT_SECRET, 'Length:', JWT_SECRET?.length)
  }

  // Public routes (including icon.png as backup)
  const publicRoutes = ['/', '/login', '/register', '/api/auth', '/api/webhooks', '/test-auth', '/icon.png', '/favicon.ico']
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    console.log(`[Middleware] No token found for ${pathname}, redirecting to login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log(`[Middleware] Token found, length: ${token.length}, verifying...`)
  console.log(`[Middleware] JWT_SECRET in middleware:`, !!JWT_SECRET, 'Length:', JWT_SECRET?.length)
  
  const payload = await verifyTokenInMiddleware(token)
  if (!payload) {
    console.log(`[Middleware] Invalid token for ${pathname}, redirecting to login`)
    console.log(`[Middleware] Token preview: ${token.substring(0, 50)}...`)
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
  
  console.log(`[Middleware] Token verified successfully for user: ${payload.email}`)

  console.log(`[Middleware] Authenticated user ${payload.email} accessing ${pathname}`)

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internal routes)
     * - favicon.ico (favicon file)
     * - icon.png (icon file)
     * - files with extensions (static assets)
     */
    '/((?!api|_next|favicon\\.ico|icon\\.png|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|map)).*)',
  ],
}

