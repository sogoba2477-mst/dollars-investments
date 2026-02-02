"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Account = {
  id: string;
  status: string;
  currency: string;
  cash: string;
  portfolio_value: string;
  buying_power: string;
  account_number?: string;
  created_at?: string;
  crypto_status?: string;
  options_approved_level?: number;
};

type Order = {
  id?: string;
  symbol?: string;
  side?: string;
  qty?: string | number;
  type?: string;
  status?: string;
  submitted_at?: string;
};

function money(n: string | number | undefined, currency = "USD") {
  const num = typeof n === "string" ? Number(n) : n ?? 0;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(num);
}

function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function shortId(id?: string) {
  if (!id) return "—";
  return id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export default function BrokerPage() {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, o] = await Promise.all([
        fetch("/api/broker/account", { cache: "no-store" }),
        fetch("/api/broker/orders", { cache: "no-store" }),
      ]);
      if (!a.ok) throw new Error(`Account API error: ${a.status}`);
      if (!o.ok) throw new Error(`Orders API error: ${o.status}`);

      setAccount((await a.json()) as Account);
      const ordersJson = (await o.json()) as Order[];
      setOrders(Array.isArray(ordersJson) ? ordersJson : []);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const currency = account?.currency ?? "USD";

  const metrics = useMemo(
    () => [
      { label: "Cash", value: money(account?.cash, currency), icon: "💵" },
      { label: "Portfolio", value: money(account?.portfolio_value, currency), icon: "📈" },
      { label: "Buying power", value: money(account?.buying_power, currency), icon: "⚡" },
      { label: "Status", value: account?.status ?? "—", icon: "🟢" },
    ],
    [account, currency]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Broker</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Account Overview
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Alpaca Markets (Paper) — server-side only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={load}
            disabled={loading}
            className="rounded-2xl bg-white text-black hover:bg-white/90"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <a
            href="/api/broker/account"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            JSON
          </a>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="font-semibold">Error</div>
          <div className="mt-1 text-red-100/90">{error}</div>
        </div>
      )}

      {/* Premium Overview Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {/* glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-white">Alpaca Paper Account</div>
            <div className="mt-1 text-xs text-white/60">
              ID: <span className="text-white/80">{shortId(account?.id)}</span>{" "}
              · Number: <span className="text-white/80">{account?.account_number ?? "—"}</span>
            </div>
            <div className="mt-1 text-xs text-white/60">
              Created: <span className="text-white/80">{formatDate(account?.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge glow>{account?.status ?? "—"}</Badge>
            <Badge>PAPER</Badge>
            <Badge>{currency}</Badge>
            <Badge>SECRETS SERVER-SIDE</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{m.label}</div>
                <div className="text-lg opacity-80 group-hover:opacity-100 transition">
                  {m.icon}
                </div>
              </div>
              <div className="mt-1 text-lg font-semibold text-white">{m.value}</div>
              <div className="mt-2 h-[1px] w-full bg-white/10" />
              <div className="mt-2 text-[11px] text-white/55">
                Real-time from internal API
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Orders</div>
            <div className="mt-1 text-xs text-white/60">{orders.length} recent orders</div>
          </div>
          <a
            href="/app/trade"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Place a market order →
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-xs text-white/60">
              <tr>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-white/70" colSpan={6}>
                    No orders yet. Place one in <span className="text-white">/app/trade</span>.
                  </td>
                </tr>
              ) : (
                orders.map((o, idx) => (
                  <tr key={o.id ?? idx} className="bg-white/0 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{o.symbol ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">{o.side ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">{String(o.qty ?? "—")}</td>
                    <td className="px-4 py-3 text-white/80">{o.type ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">{o.status ?? "—"}</td>
                    <td className="px-4 py-3 text-white/70">{formatDate(o.submitted_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  glow,
}: {
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px]",
        "border-white/15 bg-white/5 text-white/80",
        glow
          ? "shadow-[0_0_18px_rgba(52,211,153,0.25)] border-emerald-400/30"
          : "",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
