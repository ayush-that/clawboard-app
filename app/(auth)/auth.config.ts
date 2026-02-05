import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [],
  callbacks: {
    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
  },
} satisfies NextAuthConfig;
