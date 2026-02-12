import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-server";
import { ensureWallet } from "@/lib/paper/wallet";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await requireUserId();
    const wallet = await ensureWallet(userId);

    // positions = somme BUY - SELL par symbole
    const trades = await prisma.paperTrade.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const positionsMap = new Map<string, number>();
    for (const t of trades) {
      const prev = positionsMap.get(t.symbol) ?? 0;
      const qty = Number(t.qty);
      const next = t.side === "buy" ? prev + qty : prev - qty;
      positionsMap.set(t.symbol, next);
    }

    const positions = Array.from(positionsMap.entries())
      .filter(([, qty]) => Math.abs(qty) > 0)
      .map(([symbol, qty]) => ({ symbol, qty }));

    return NextResponse.json({
      currency: wallet.currency,
      cash: wallet.cash,
      positions,
    });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const code = msg === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "PAPER_BALANCE_FAILED", message: msg }, { status: code });
  }
}
