import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS preflight for API routes
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response, request.nextUrl.origin, origin);
    return response;
  }

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const authPages = ["/login", "/register"];

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    // Let unauthenticated users access login/register pages
    if (authPages.includes(pathname)) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      setCorsHeaders(response, request.nextUrl.origin, origin);
      return response;
    }

    const redirectUrl = encodeURIComponent(pathname);

    return NextResponse.redirect(
      new URL(`/login?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  // Redirect authenticated users away from auth pages
  if (authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();

  // Add CORS headers to API responses
  if (pathname.startsWith("/api/")) {
    setCorsHeaders(response, request.nextUrl.origin, origin);
  }

  return response;
}

function setCorsHeaders(
  response: NextResponse,
  sameOrigin: string,
  requestOrigin: string | null
) {
  // Only allow same-origin requests
  if (requestOrigin && requestOrigin !== sameOrigin) {
    return;
  }

  response.headers.set("Access-Control-Allow-Origin", sameOrigin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
