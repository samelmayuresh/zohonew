import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes: { [key: string]: string[] } = {
  '/dashboard/users': ['super_admin', 'admin'],
  '/dashboard/leads': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  '/dashboard/tasks': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent'],
  '/dashboard/support': ['super_admin', 'admin', 'support_agent', 'customer'],
  '/dashboard/reports': ['super_admin', 'admin', 'sales_manager'],
  '/dashboard/projects': ['customer'],
  '/dashboard/billing': ['super_admin', 'customer'],
  '/dashboard/settings': ['super_admin'],
  '/dashboard': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent', 'customer'],
}

// Public routes that don't require authentication
const publicRoutes = ['/login', '/', '/unauthorized']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = pathname.startsWith('/dashboard')

  if (isProtectedRoute) {
    // For demo purposes, we'll handle authentication primarily on the client side
    // In production, you'd want more robust server-side validation
    
    // Check specific route permissions
    const matchedRoute = Object.keys(protectedRoutes).find(route => 
      pathname.startsWith(route) && route !== '/dashboard'
    )

    if (matchedRoute) {
      const response = NextResponse.next()
      response.headers.set('x-required-roles', JSON.stringify(protectedRoutes[matchedRoute]))
      return response
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}