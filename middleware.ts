import NextAuth from "next-auth";
import { authConfig } from "@/app/(auth)/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login, /register (auth pages)
     * - /api/auth/* (NextAuth API routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    "/((?!login|register|api/auth|_next|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
