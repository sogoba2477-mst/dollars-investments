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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // obligatoire (surtout en prod)
  secret: mustEnv("NEXTAUTH_SECRET"),

  session: { strategy: "database" },

  // IMPORTANT: force cookies sécurisés en prod
  useSecureCookies: isProd,

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
      // baseUrl vient de NEXTAUTH_URL (donc dollars.investments)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
};
