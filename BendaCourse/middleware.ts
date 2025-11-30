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
    return payload as JWTPayload
  } catch (error) {
    console.error('[Middleware verifyToken] Error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl
  
  // Debug JWT_SECRET
  if (pathname === '/dashboard') {
    console.log(`[Middleware] JWT_SECRET available:`, !!JWT_SECRET, 'Length:', JWT_SECRET?.length)
  }

  // Public routes
  const publicRoutes = ['/', '/login', '/register', '/api/auth', '/api/webhooks', '/test-auth']
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

