import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "regular";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const failedLoginAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();

function cleanupStaleEntries() {
  const now = Date.now();
  for (const [email, entry] of failedLoginAttempts) {
    if (now - entry.lastAttempt > LOCKOUT_WINDOW_MS) {
      failedLoginAttempts.delete(email);
    }
  }
}

function isLockedOut(email: string): boolean {
  cleanupStaleEntries();
  const entry = failedLoginAttempts.get(email);
  if (!entry) {
    return false;
  }
  return (
    entry.count >= MAX_FAILED_ATTEMPTS &&
    Date.now() - entry.lastAttempt < LOCKOUT_WINDOW_MS
  );
}

function recordFailedAttempt(email: string) {
  const entry = failedLoginAttempts.get(email);
  const now = Date.now();
  if (entry && now - entry.lastAttempt < LOCKOUT_WINDOW_MS) {
    entry.count += 1;
    entry.lastAttempt = now;
  } else {
    failedLoginAttempts.set(email, { count: 1, lastAttempt: now });
  }
}

function clearFailedAttempts(email: string) {
  failedLoginAttempts.delete(email);
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials: Record<string, unknown>) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (isLockedOut(email)) {
          console.warn(
            `[Security] Account locked out due to too many failed attempts: ${email}`
          );
          return null;
        }

        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          recordFailedAttempt(email);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          recordFailedAttempt(email);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          recordFailedAttempt(email);
          return null;
        }

        clearFailedAttempts(email);
        return { ...user, type: "regular" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
