import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STARTING_CASH = 50000;

function n(v: any) {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

function money(v: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

export default async function AppHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/app");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user?.id) redirect("/login?callbackUrl=/app");

  // Ensure initial paper deposit exists (idempotent)
  const existingDeposit = await prisma.transaction.findFirst({
    where: { userId: user.id, kind: "PAPER_DEPOSIT" },
    select: { id: true },
  });

  if (!existingDeposit) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        kind: "PAPER_DEPOSIT",
        amount: STARTING_CASH,
        meta: { note: "Initial paper deposit" },
      },
    });
  }

  // Cash impact from filled orders (uses filledAvgPrice)
  const filledOrders = await prisma.order.findMany({
    where: { userId: user.id, status: "filled" },
    select: { side: true, qty: true, filledAvgPrice: true },
  });

  let cashDelta = 0;
  for (const o of filledOrders) {
    const px = o.filledAvgPrice ? n(o.filledAvgPrice) : 0;
    const qty = n(o.qty);
    if (!px || !qty) continue;

    const notional = px * qty;
    if (o.side === "buy") cashDelta -= notional;
    if (o.side === "sell") cashDelta += notional;
  }

  const cash = STARTING_CASH + cashDelta;

  // Positions value from stored avgPrice (simple)
  const positions = await prisma.position.findMany({
    where: { userId: user.id },
    select: { qty: true, avgPrice: true },
  });

  let positionsValue = 0;
  for (const p of positions) {
    positionsValue += n(p.qty) * n(p.avgPrice ?? 0);
  }

  const portfolio = cash + positionsValue;

  const ordersCount = await prisma.order.count({ where: { userId: user.id } });
  const positionsCount = await prisma.position.count({ where: { userId: user.id } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <p className="text-muted-foreground">
        Signed in as <span className="font-medium">{user.email}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Balance (Paper)</div>
          <div className="mt-2 text-sm text-muted-foreground">{money(cash)}</div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Portfolio (Paper)</div>
          <div className="mt-2 text-sm text-muted-foreground">{money(portfolio)}</div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Activity</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {positionsCount} positions — {ordersCount} orders
          </div>
        </div>
      </div>
    </div>
  );
}
