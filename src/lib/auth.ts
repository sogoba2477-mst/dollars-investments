import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function hasEmailEnv() {
  return (
    !!process.env.EMAIL_SERVER_HOST &&
    !!process.env.EMAIL_SERVER_PORT &&
    !!process.env.EMAIL_SERVER_USER &&
    !!process.env.EMAIL_SERVER_PASSWORD &&
    !!process.env.EMAIL_FROM
  );
}

const isProd = process.env.NODE_ENV === "production";
const canonicalUrl = isProd ? "https://dollars.investments" : "http://localhost:3001";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: mustEnv("NEXTAUTH_SECRET"),

  session: { strategy: "database" },

  providers: [
    GoogleProvider({
      clientId: mustEnv("GOOGLE_CLIENT_ID"),
      clientSecret: mustEnv("GOOGLE_CLIENT_SECRET"),
    }),

    ...(hasEmailEnv()
      ? [
          EmailProvider({
            server: {
              host: mustEnv("EMAIL_SERVER_HOST"),
              port: Number(mustEnv("EMAIL_SERVER_PORT")),
              auth: {
                user: mustEnv("EMAIL_SERVER_USER"),
                pass: mustEnv("EMAIL_SERVER_PASSWORD"),
              },
            },
            from: mustEnv("EMAIL_FROM"),
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      const base = isProd ? canonicalUrl : baseUrl;

      // Autorise les redirects internes
      if (url.startsWith("/")) return `${base}${url}`;

      // Autorise uniquement le même origin
      try {
        const u = new URL(url);
        if (u.origin === base) return url;
      } catch {}

      return base;
    },
  },
};
