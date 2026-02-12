import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-server";
import { ensureWallet } from "@/lib/paper/wallet";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await requireUserId();
    await ensureWallet(userId);

    const trades = await prisma.paperTrade.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const map = new Map<string, number>();
    for (const t of trades) {
      const prev = map.get(t.symbol) ?? 0;
      const qty = Number(t.qty);
      map.set(t.symbol, t.side === "buy" ? prev + qty : prev - qty);
    }

    const positions = Array.from(map.entries())
      .filter(([, qty]) => Math.abs(qty) > 0)
      .map(([symbol, qty]) => ({ symbol, qty }));

    return NextResponse.json(positions);
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const code = msg === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "PAPER_POSITIONS_FAILED", message: msg }, { status: code });
  }
}
