"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      await signIn("email", { email, callbackUrl: "/app" });
    } finally {
      setLoadingEmail(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background2.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-white/5">
              <span className="text-sm font-semibold text-white/90">D</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                dollars.investments
              </div>
              <div className="text-[11px] text-white/70">
                Private. Secure. Broker-powered.
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-widest text-white/50">
            Create account
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Get started
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Sign up with Google, or receive a secure magic link by email.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full rounded-2xl bg-white text-black hover:bg-white/90"
              onClick={() =>
                signIn("google", { callbackUrl: "/app", prompt: "select_account" })
              }
            >
              Continue with Google
            </Button>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <form onSubmit={sendMagicLink} className="space-y-3">
                <div>
                  <label className="text-xs text-white/60">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!email || loadingEmail}
                  className="
                    w-full rounded-2xl bg-white text-black
                    hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]
                    hover:scale-[1.01] transition
                    disabled:opacity-50 disabled:hover:shadow-none disabled:hover:scale-100
                  "
                >
                  {loadingEmail ? "Sending…" : "Send magic link"}
                </Button>

                <p className="text-xs text-white/55">
                  Check your inbox and click the sign-in link.
                </p>
              </form>
            </div>

            <div className="text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="text-white underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-white/40">
        © {new Date().getFullYear()} dollars.investments — Secure authentication
      </footer>
    </div>
  );
}
