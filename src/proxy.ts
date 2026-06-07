import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  // Default to public if no variable is set
  const appRole = process.env.APP_ROLE || 'public';

  // 1. If this is deployed as the "public" site, block the admin panel
  if (appRole === 'public' && url.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. If this is deployed as the "admin" site, block the public viewing pages
  if (appRole === 'admin' && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
    // Ignore internal next requests and public files (like favicon)
    if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths so the middleware can check both public and admin routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
