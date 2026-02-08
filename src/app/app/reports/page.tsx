import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/app/reports");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/app" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl border border-white/15 bg-white/5 grid place-items-center">
              <span className="text-white/90 text-sm font-semibold">D</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                dollars.investments
              </div>
              <div className="text-[11px] text-white/70">Reports</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/app"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/app/trade"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Trade
            </Link>
            <Link
              href="/app/broker"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Broker
            </Link>
            <Link
              href="/logout"
              className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-widest text-white/50">Reports</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reporting Center</h1>
          <p className="mt-2 text-sm text-white/70">
            Coming next: P&amp;L, positions breakdown, orders history export (CSV), monthly statements.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold">Orders</div>
              <div className="mt-1 text-xs text-white/60">Export + filters</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold">Positions</div>
              <div className="mt-1 text-xs text-white/60">Allocation + risk</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold">Performance</div>
              <div className="mt-1 text-xs text-white/60">Monthly returns</div>
            </div>
          </div>

          <div className="mt-6 text-xs text-white/50">
            Signed in as <span className="text-white/80">{session.user?.email}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
