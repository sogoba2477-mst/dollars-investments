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

type Position = {
  symbol?: string;
  qty?: string | number;
  avg_entry_price?: string | number;
  market_value?: string | number;
  unrealized_pl?: string | number;
};

function formatDate(d?: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        fetch("/api/broker/orders", { cache: "no-store" }),
        fetch("/api/broker/positions", { cache: "no-store" }),
      ]);

      const oJson = await oRes.json().catch(() => []);
      const pJson = await pRes.json().catch(() => []);

      setOrders(Array.isArray(oJson) ? oJson : []);
      setPositions(Array.isArray(pJson) ? pJson : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Read-only reports from broker API (paper).</p>
        </div>

        <Button onClick={load} disabled={loading} className="rounded-2xl">
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Positions</div>
          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs">
                <tr>
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Avg</th>
                  <th className="px-3 py-2">UPL</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                      No positions.
                    </td>
                  </tr>
                ) : (
                  positions.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{p.symbol ?? "—"}</td>
                      <td className="px-3 py-2">{String(p.qty ?? "—")}</td>
                      <td className="px-3 py-2">{String(p.avg_entry_price ?? "—")}</td>
                      <td className="px-3 py-2">{String(p.unrealized_pl ?? "—")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Orders</div>
          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs">
                <tr>
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Side</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                      No orders.
                    </td>
                  </tr>
                ) : (
                  orders.map((o, i) => (
                    <tr key={o.id ?? i} className="border-t">
                      <td className="px-3 py-2">{o.symbol ?? "—"}</td>
                      <td className="px-3 py-2">{o.side ?? "—"}</td>
                      <td className="px-3 py-2">{String(o.qty ?? "—")}</td>
                      <td className="px-3 py-2">{o.status ?? "—"}</td>
                      <td className="px-3 py-2">{formatDate(o.submitted_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex gap-2">
            <a className="text-sm underline" href="/api/broker/orders" target="_blank" rel="noreferrer">
              Orders JSON
            </a>
            <a className="text-sm underline" href="/api/broker/positions" target="_blank" rel="noreferrer">
              Positions JSON
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
