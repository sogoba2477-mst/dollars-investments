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
};
