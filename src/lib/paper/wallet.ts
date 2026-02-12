import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_DEPOSIT = new Prisma.Decimal("50000");

export async function ensureWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.create({
      data: {
        userId,
        currency: "USD",
        cash: DEFAULT_DEPOSIT,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        kind: "DEPOSIT",
        amount: DEFAULT_DEPOSIT,
        meta: { reason: "Paper default deposit", amount: "50000" },
      },
    });

    return wallet;
  });
}
