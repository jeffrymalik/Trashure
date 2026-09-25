import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  warga: ['/warga'],
  petugas: ['/petugas'],
  pengepul: ['/pengepul'],
};

const authRoutes = ['/', '/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('trashure_token')?.value;
  const role = request.cookies.get('trashure_role')?.value;

  // If logged in and trying to access login page, redirect to dashboard
  if (token && authRoutes.includes(pathname)) {
    const dashboardMap: Record<string, string> = {
      admin: '/admin/dashboard',
      petugas: '/petugas/dashboard',
      pengepul: '/pengepul/dashboard',
      warga: '/warga/dashboard',
    };
    return NextResponse.redirect(new URL(dashboardMap[role || 'admin'], request.url));
  }

  // If not logged in, redirect to login
  if (!token) {
    if (authRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('trashure_role');
    return response;
  }

  // If logged in but accessing wrong role route, redirect to own dashboard
  if (role) {
    const allowedPrefixes = roleRoutes[role] || [];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isAllowed && !authRoutes.includes(pathname)) {
      const dashboardMap: Record<string, string> = {
        admin: '/admin/dashboard',
        petugas: '/petugas/dashboard',
        pengepul: '/pengepul/dashboard',
        warga: '/warga/dashboard',
      };
      return NextResponse.redirect(new URL(dashboardMap[role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/warga/:path*', '/petugas/:path*', '/pengepul/:path*'],
};
