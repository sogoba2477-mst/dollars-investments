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

// Cookies partagés entre www et apex
const COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".dollars.investments" : undefined;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // IMPORTANT en prod
  secret: mustEnv("NEXTAUTH_SECRET"),

  // Sur Vercel/proxy, aide NextAuth à faire confiance au host
  trustHost: true,

  // DB sessions (ok)
  session: { strategy: "database" },

  providers: [
    GoogleProvider({
      clientId: mustEnv("GOOGLE_CLIENT_ID"),
      clientSecret: mustEnv("GOOGLE_CLIENT_SECRET"),
      // Optionnel mais utile quand tu as plusieurs environnements
      allowDangerousEmailAccountLinking: false,
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

  pages: { signIn: "/login" },

  // ✅ Clé: cookies sur le domaine parent (www + apex)
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // ⚠️ __Host- cookie ne doit PAS avoir domain en prod
        ...(process.env.NODE_ENV === "production" ? {} : { domain: COOKIE_DOMAIN }),
      },
    },
    state: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.state"
          : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    nonce: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.nonce"
          : "next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Empêche les redirects vers un autre domaine
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Optionnel: active si tu veux voir plus de logs côté Vercel
  // debug: process.env.NODE_ENV !== "production",
};
