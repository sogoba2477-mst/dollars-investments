import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const STARTING_CASH = 50000;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user?.id) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // Ensure a starting deposit exists (idempotent)
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

    // Load filled orders to compute cash impact (use filledAvgPrice)
    const filledOrders = await prisma.order.findMany({
      where: { userId: user.id, status: "filled" },
      select: { side: true, qty: true, filledAvgPrice: true },
    });

    let cashDelta = 0;
    for (const o of filledOrders) {
      const px = o.filledAvgPrice ? Number(o.filledAvgPrice) : null;
      const qty = Number(o.qty);
      if (!px || !qty) continue;

      const notional = px * qty;
      if (o.side === "buy") cashDelta -= notional;
      if (o.side === "sell") cashDelta += notional;
    }

    // Starting cash + cashDelta (from trading)
    const cash = STARTING_CASH + cashDelta;

    // Portfolio = cash + positions mark (qty * avgPrice)
    const positions = await prisma.position.findMany({
      where: { userId: user.id },
      select: { qty: true, avgPrice: true },
    });

    let positionsValue = 0;
    for (const p of positions) {
      const qty = Number(p.qty);
      const px = p.avgPrice ? Number(p.avgPrice) : 0;
      positionsValue += qty * px;
    }

    const portfolio = cash + positionsValue;

    // Simple buying power rule (2x cash) for paper
    const buyingPower = cash * 2;

    return NextResponse.json({
      cash,
      portfolio,
      buyingPower,
      currency: "USD",
      mode: "paper",
      engine: "internal-paper",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "PAPER_BALANCE_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
