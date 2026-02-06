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

// IMPORTANT : unifie tes hosts. En prod, utilise uniquement l’apex.
const canonicalUrl = isProd ? "https://dollars.investments" : "http://localhost:3001";

// Pour éviter le state mismatch si www est touché, on partage les cookies entre sous-domaines.
const cookieDomain = isProd ? ".dollars.investments" : undefined;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // Obligatoire en prod
  secret: mustEnv("NEXTAUTH_SECRET"),

  // DB sessions (Prisma)
  session: { strategy: "database" },

  // Recommandé : base URL canonique
  // (NEXTAUTH_URL est côté env, mais ça aide à garder un mental model clair)
  // NextAuth lit surtout NEXTAUTH_URL, donc garde NEXTAUTH_URL = canonicalUrl dans Vercel.
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

  cookies: {
    // Ces cookies sont critiques pour OAuth (state/pkce/csrf). Domain partagé => moins de mismatch.
    sessionToken: {
      name: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: isProd ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: isProd ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        // NOTE: __Host- cookies ne doivent pas avoir de domain.
        // Donc seulement en dev on n'applique rien, en prod on laisse domain undefined pour csrf si __Host.
      },
    },
    state: {
      name: isProd ? "__Secure-next-auth.state" : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: cookieDomain,
      },
    },
    pkceCodeVerifier: {
      name: isProd ? "__Secure-next-auth.pkce.code_verifier" : "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: cookieDomain,
      },
    },
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Force l’apex en prod
      const base = isProd ? canonicalUrl : baseUrl;

      if (url.startsWith("/")) return `${base}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === base) return url;
      } catch {}
      return base;
    },
  },
};
