"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Account = {
  id: string;
  status: string;
  currency: string;
  cash: string;
  portfolio_value: string;
  buying_power: string;
};

type OrderRow = {
  id: string;
  symbol: string;
  qty: string;
  side: string;
  type: string;
  status: string;
  submitted_at?: string;
};

export default function BrokerPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const [aRes, oRes] = await Promise.all([
        fetch("/api/broker/account", { cache: "no-store" }),
        fetch("/api/broker/orders", { cache: "no-store" }),
      ]);

      const aJson = await aRes.json();
      const oJson = await oRes.json();

      if (!aRes.ok) throw new Error(JSON.stringify(aJson));
      if (!oRes.ok) throw new Error(JSON.stringify(oJson));

      setAccount(aJson);
      setOrders(Array.isArray(oJson) ? oJson : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load broker data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Broker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alpaca Paper account and recent orders (server-side).
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {err ? (
        <div className="mt-6 rounded-2xl border border-red-200 p-4">
          <div className="text-sm font-semibold text-red-600">Error</div>
          <pre className="mt-2 whitespace-pre-wrap text-xs">{err}</pre>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Account">
          {!account ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Metric label="Status" value={account.status} />
              <Metric label="Currency" value={account.currency} />
              <Metric label="Cash" value={formatMoney(account.cash)} />
              <Metric label="Portfolio value" value={formatMoney(account.portfolio_value)} />
              <Metric label="Buying power" value={formatMoney(account.buying_power)} />
              <Metric label="Account ID" value={shortId(account.id)} mono />
            </div>
          )}
        </Card>

        <Card title="Environment">
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Broker" value="Alpaca Markets" />
            <Metric label="Mode" value="Paper Trading (Sandbox)" />
            <Metric label="API" value="Server-side only" />
            <Metric label="Secrets" value="Never exposed to frontend" />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card title={`Orders (${orders.length})`}>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-3 font-medium">{o.symbol}</td>
                    <td className="p-3">{o.side}</td>
                    <td className="p-3">{o.qty}</td>
                    <td className="p-3">{o.type}</td>
                    <td className="p-3">{o.status}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {o.submitted_at ? String(o.submitted_at) : "—"}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={6}>
                      No orders yet. Place one in <span className="font-medium text-foreground">/app/trade</span>.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function formatMoney(v: string) {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function shortId(id: string) {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}
