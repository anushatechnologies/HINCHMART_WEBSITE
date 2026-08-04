import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Seller Portal Routes
  if (pathname.startsWith('/seller/dashboard')) {
    const sellerToken = request.cookies.get('seller_token');
    
    if (!sellerToken?.value) {
      // Redirect to seller login if no token is found
      const loginUrl = new URL('/seller/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Note: In an Edge environment, we only check for cookie presence. 
    // Deep JWT verification is enforced on the actual Backend APIs.
    // If the backend returns 401 on data fetch, the client will log them out.
  }

  // Future-proofing: We could also protect Admin or Customer routes here.

  return NextResponse.next();
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
};
