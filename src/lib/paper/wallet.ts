import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const STARTING_CASH = new Prisma.Decimal("50000.000000");

export async function ensureWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.wallet.create({
    data: {
      userId,
      currency: "USD",
      cash: STARTING_CASH,
    },
  });
}

export async function applyPaperTrade(params: {
  userId: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
}) {
  const qty = new Prisma.Decimal(String(params.qty));
  const price = new Prisma.Decimal(String(params.price));
  const notional = qty.mul(price); // qty * price

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId: params.userId },
      create: { userId: params.userId, currency: "USD", cash: STARTING_CASH },
      update: {},
    });

    const nextCash =
      params.side === "buy" ? wallet.cash.sub(notional) : wallet.cash.add(notional);

    if (nextCash.lt(new Prisma.Decimal("0"))) {
      throw new Error("INSUFFICIENT_PAPER_CASH");
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId: params.userId },
      data: { cash: nextCash },
    });

    await tx.paperTrade.create({
      data: {
        userId: params.userId,
        symbol: params.symbol.toUpperCase(),
        side: params.side,
        qty,
        price,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        walletId: updatedWallet.id,
        kind: params.side === "buy" ? "BUY" : "SELL",
        symbol: params.symbol.toUpperCase(),
        qty,
        price,
        amount: params.side === "buy" ? notional.mul(-1) : notional,
      },
    });

    return { wallet: updatedWallet };
  });
}
