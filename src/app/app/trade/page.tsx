"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Order = {
  id?: string;
  symbol?: string;
  side?: string;
  qty?: string | number;
  type?: string;
  status?: string;
  submitted_at?: string;
};

function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

type Toast = { type: "success" | "error"; title: string; message?: string } | null;

export default function TradePage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [qty, setQty] = useState<number>(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [tif, setTif] = useState<"day" | "gtc">("day");
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [toast, setToast] = useState<Toast>(null);

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/broker/orders", { cache: "no-store" });
      const json = (await res.json()) as Order[];
      setOrders(Array.isArray(json) ? json : []);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function placeMarketOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/broker/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          qty,
          side,
          type: "market",
          time_in_force: tif,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({
          type: "error",
          title: "Order failed",
          message: data?.error ?? `HTTP ${res.status}`,
        });
        return;
      }

      setToast({
        type: "success",
        title: "Order placed",
        message: `${side.toUpperCase()} ${qty} ${symbol.toUpperCase()} (market)`,
      });

      await loadOrders(); // refresh orders after success
    } catch (e: any) {
      setToast({
        type: "error",
        title: "Network error",
        message: e?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={[
            "fixed right-4 top-4 z-50 w-[340px] rounded-2xl border p-4 backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              : "border-red-500/30 bg-red-500/10 text-red-100",
          ].join(" ")}
        >
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.message && <div className="mt-1 text-sm opacity-90">{toast.message}</div>}
          <div className="mt-3 h-[2px] w-full overflow-hidden rounded bg-white/10">
            <div className="h-full w-full bg-white/40 animate-[shrink_3.4s_linear_forwards]" />
          </div>
          <style jsx>{`
            @keyframes shrink {
              from { transform: translateX(0%); }
              to { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Trade</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Market Order
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Paper trading only — server-side execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadOrders}
            disabled={loadingOrders}
            className="rounded-2xl bg-white text-black hover:bg-white/90"
          >
            {loadingOrders ? "Refreshing…" : "Refresh Orders"}
          </Button>
          <a
            href="/api/broker/orders"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            JSON
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <form onSubmit={placeMarketOrder} className="grid gap-4 md:grid-cols-4">
          <Field label="Symbol">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              placeholder="AAPL"
            />
          </Field>

          <Field label="Qty">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              min={1}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
            />
          </Field>

          <Field label="Side">
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as any)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="buy">buy</option>
              <option value="sell">sell</option>
            </select>
          </Field>

          <Field label="Time in force">
            <select
              value={tif}
              onChange={(e) => setTif(e.target.value as any)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
            >
              <option value="day">day</option>
              <option value="gtc">gtc</option>
            </select>
          </Field>

          <div className="md:col-span-4 flex items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              Type: <span className="text-white/80">market</span> · Endpoint: Alpaca Paper
            </div>

            <Button
              type="submit"
              disabled={loading || !symbol || qty <= 0}
              className="rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? "Placing…" : "Place market order"}
            </Button>
          </div>
        </form>
      </div>

      {/* Orders list */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Recent orders</div>
            <div className="mt-1 text-xs text-white/60">{orders.length} orders</div>
          </div>
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
                    No orders yet.
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-white/60">{label}</div>
      {children}
    </div>
  );
}
