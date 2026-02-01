import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // Protect /app without Edge middleware
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background1.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/90" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-dollars.png"
              alt="dollars.investments"
              width={28}
              height={28}
              className="rounded-sm"
              priority
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                dollars.investments
              </div>
              <div className="text-[11px] text-white/70">
                Private. Secure. Broker-powered.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="/app">Dashboard</NavLink>
            <NavLink href="/app/trade">Trade</NavLink>
            <NavLink href="/app/broker">Broker</NavLink>
            <NavLink href="/app/reports">Reports</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/logout">Logout</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-white/40">
        © 2026 dollars.investments — Paper trading sandbox
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
