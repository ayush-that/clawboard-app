import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { getOrCreateUserByEmail, getUser } from "@/lib/db/queries";
import {
  getCounter,
  incrementCounter,
  resetCounter,
} from "@/lib/redis/rate-limiter";
import { authConfig } from "./auth.config";

export type UserType = "regular";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function isLockedOut(email: string): Promise<boolean> {
  try {
    const count = await getCounter(`login:${email}`);
    return count >= MAX_FAILED_ATTEMPTS;
  } catch {
    // Redis unavailable — allow login to avoid locking everyone out
    return false;
  }
}

async function recordFailedAttempt(email: string) {
  try {
    await incrementCounter(`login:${email}`, LOCKOUT_WINDOW_MS);
  } catch {
    // Redis unavailable — best-effort
  }
}

async function clearFailedAttempts(email: string) {
  try {
    await resetCounter(`login:${email}`);
  } catch {
    // Redis unavailable — best-effort
  }
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

        if (await isLockedOut(email)) {
          console.warn(
            `[Security] Account locked out due to too many failed attempts: ${email}`
          );
          return null;
        }

        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          await recordFailedAttempt(email);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          await recordFailedAttempt(email);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          await recordFailedAttempt(email);
          return null;
        }

        await clearFailedAttempts(email);
        return { ...user, type: "regular" };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) {
          return false;
        }

        // Get or create DB user — links Google sign-in to existing
        // email/password account if one exists
        await getOrCreateUserByEmail(email);
        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // Look up the DB user by email so the JWT holds the correct DB user ID
          const email = token.email as string;
          const dbUser = await getOrCreateUserByEmail(email);
          token.id = dbUser.id;
          token.type = "regular" as UserType;
        } else {
          token.id = user.id as string;
          token.type = user.type;
        }
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
