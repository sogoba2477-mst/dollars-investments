import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureWallet } from "@/lib/paper/wallet";

export default async function AppHome() {
  const session = await getServerSession(authOptions);

  const email = session?.user?.email ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  let cash: string | null = null;
  let positionsCount: number | null = null;
  let ordersCount: number | null = null;

  if (user) {
    const wallet = await ensureWallet(user.id);
    cash = wallet.cash.toString();

    const trades = await prisma.paperTrade.findMany({
      where: { userId: user.id },
      select: { symbol: true, side: true, qty: true },
    });

    const map = new Map<string, number>();
    for (const t of trades) {
      const prev = map.get(t.symbol) ?? 0;
      const q = Number(t.qty);
      map.set(t.symbol, t.side === "buy" ? prev + q : prev - q);
    }
    positionsCount = Array.from(map.values()).filter((q) => Math.abs(q) > 0).length;

    ordersCount = await prisma.paperOrder.count({ where: { userId: user.id } });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as <span className="font-medium">{session?.user?.email ?? "unknown"}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Cash (paper)</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {cash ? `$${cash}` : "—"}
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Positions</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {positionsCount == null ? "—" : positionsCount}
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Orders</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {ordersCount == null ? "—" : ordersCount}
          </div>
        </div>
      </div>
    </div>
  );
}
