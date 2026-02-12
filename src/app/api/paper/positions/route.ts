import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

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

    const positions = await prisma.position.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(positions);
  } catch (err: any) {
    return NextResponse.json(
      { error: "PAPER_POSITIONS_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
