import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Run middleware in Node.js runtime so we can reuse existing server-side JWT validation
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes to protect (pages)
  const protectedPages = ['/dashboard', '/profile'];

  // API endpoints (actions) to protect
  const protectedApis = ['/api/generate', '/api/feedback', '/api/sessions'];

  const isProtectedPage = protectedPages.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isProtectedApi = protectedApis.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (isProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'intervo_super_secret_key';

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown> | null;

    if (!decoded) {
      if (isProtectedPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  } catch (err) {
    if (isProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Token valid — allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/generate',
    '/api/feedback',
    '/api/sessions',
  ],
};
