"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border p-6">
          <h1 className="text-xl font-semibold tracking-tight">Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with Google or receive a secure magic link by email.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/app" })}
            >
              Continue with Google
            </Button>

            <div className="rounded-xl border p-3">
              <label className="text-sm font-medium">Email</label>
              <input
                className="mt-2 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                className="mt-3 w-full"
                variant="outline"
                onClick={() => signIn("email", { email, callbackUrl: "/app" })}
                disabled={!email}
              >
                Send magic link
              </Button>

              <p className="mt-2 text-xs text-muted-foreground">
                Check your inbox and click the sign-in link.
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            No account?{" "}
            <Link className="text-foreground underline" href="/signup">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
