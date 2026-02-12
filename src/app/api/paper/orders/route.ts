import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-server";
import { ensureWallet } from "@/lib/paper/wallet";

export const runtime = "nodejs";

// V1: prix fixe (on fera quote plus tard via Alpaca market data)
function mockPrice(symbol: string) {
  // simple et stable pour MVP
  return new Prisma.Decimal("100");
}

const PlaceSchema = z.object({
  symbol: z.string().min(1).max(10).transform((s) => s.toUpperCase()),
  qty: z.coerce.number().positive().max(100000),
  side: z.enum(["buy", "sell"]),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const orders = await prisma.paperOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json(
      { error: "PAPER_ORDERS_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    await ensureWallet(userId);

    const body = await req.json();
    const data = PlaceSchema.parse(body);

    const price = mockPrice(data.symbol);
    const qty = new Prisma.Decimal(String(data.qty));
    const notional = price.mul(qty); // price * qty

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("WALLET_NOT_FOUND");

      // SELL validation v1: pas de short (on ajoutera short plus tard)
      if (data.side === "sell") {
        const trades = await tx.paperTrade.findMany({ where: { userId, symbol: data.symbol } });
        let pos = 0;
        for (const t of trades) pos += (t.side === "buy" ? 1 : -1) * Number(t.qty);
        if (pos < data.qty) throw new Error("INSUFFICIENT_POSITION");
      }

      // BUY validation: cash suffisant
      if (data.side === "buy") {
        if (wallet.cash.lt(notional)) throw new Error("INSUFFICIENT_CASH");
      }

      // Update cash
      const cashDelta = data.side === "buy" ? notional.mul(new Prisma.Decimal("-1")) : notional;
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { cash: wallet.cash.add(cashDelta) },
      });

      // Ledger entry
      await tx.ledgerEntry.create({
        data: {
          walletId: updatedWallet.id,
          kind: data.side === "buy" ? "BUY" : "SELL",
          symbol: data.symbol,
          qty,
          price,
          amount: cashDelta,
          meta: { source: "paper", v: 1 },
        },
      });

      // Trade
      await tx.paperTrade.create({
        data: {
          userId,
          symbol: data.symbol,
          side: data.side,
          qty,
          price,
        },
      });

      // Order
      const order = await tx.paperOrder.create({
        data: {
          userId,
          symbol: data.symbol,
          side: data.side,
          type: "market",
          qty,
          status: "filled",
          filledPrice: price,
        },
      });

      return order;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";

    if (msg === "INSUFFICIENT_CASH" || msg === "INSUFFICIENT_POSITION") {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (err?.issues) {
      return NextResponse.json({ error: "VALIDATION_ERROR", issues: err.issues }, { status: 400 });
    }

    const code = msg === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "PAPER_ORDER_FAILED", message: msg }, { status: code });
  }
}
