import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BrokerPublicPage() {
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
            <div className="h-8 w-8 rounded-xl border border-white/15 bg-white/5 grid place-items-center">
              <span className="text-white/90 text-sm font-semibold">D</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                dollars.investments
              </div>
              <div className="text-[11px] text-white/70">
                Broker-powered investing — paper sandbox
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
            <Button className="rounded-2xl bg-white text-black hover:bg-white/90" asChild>
              <Link href="/app">Open Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-widest text-white/50">
              Broker
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Alpaca Markets integration
            </h1>
            <p className="mt-3 text-white/70 leading-relaxed">
              A secure broker connector for account, orders and positions.
              Keys are server-side only. The UI consumes your internal API routes.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>ACTIVE</Badge>
              <Badge>PAPER</Badge>
              <Badge>USD</Badge>
              <Badge>SERVER-SIDE SECRETS</Badge>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-2xl bg-white text-black hover:bg-white/90" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/app/broker">See broker panel</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="text-sm font-medium text-white">What you get</div>

            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex gap-3">
                <Dot />
                <span>Account overview (cash, portfolio value, buying power)</span>
              </li>
              <li className="flex gap-3">
                <Dot />
                <span>Orders list + market order creation</span>
              </li>
              <li className="flex gap-3">
                <Dot />
                <span>Positions list (paper)</span>
              </li>
              <li className="flex gap-3">
                <Dot />
                <span>Premium fintech UI (glass + dark luxury)</span>
              </li>
            </ul>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
              Endpoint: <span className="text-white/90">paper-api.alpaca.markets</span>
              <br />
              Keys: <span className="text-white/90">never exposed to frontend</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-white/40">
        © {new Date().getFullYear()} dollars.investments — Broker integration preview
      </footer>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80">
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
  );
}
