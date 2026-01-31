import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="text-xs uppercase tracking-widest text-white/60">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background1.jpg')" }}
      />

      {/* Premium overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 pt-20">
        <div className="w-full">
          {/* Top badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            Broker-executed trades • Compliance handled by partner
          </div>

          {/* Main glass card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl sm:p-10">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/logo-dollars.ico"
                alt="Dollars Investments Icon"
                width={44}
                height={44}
              />
              <span className="text-sm uppercase tracking-widest text-white/70">
                Dollars Investments
              </span>
            </div>

            <h1 className="mt-6 text-center text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Invest with clarity.
              <span className="block text-white/70">Execute with a real broker.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-center text-base text-white/70 sm:text-lg">
              A premium front-end to view portfolio, place trades in sandbox,
              and export reports. Keys stay server-side. Built for production.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">Create account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>

            {/* Trust line */}
            <div className="mt-6 text-center text-xs text-white/50">
              Sandbox first • No payment required • Server-side broker keys • Audit-friendly logs (MVP)
            </div>

            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Stat label="Execution" value="Broker API (Sandbox)" />
              <Stat label="Reporting" value="Orders + CSV export" />
              <Stat label="Security" value="Secrets never in frontend" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-10 flex justify-center">
            <div className="flex flex-col items-center gap-2 text-white/50">
              <div className="text-xs uppercase tracking-widest">Scroll</div>
              <div className="h-10 w-[2px] overflow-hidden rounded bg-white/10">
                <div className="h-6 w-full animate-pulse bg-white/40" />
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-8" />
        </div>
      </div>
    </section>
  );
}
