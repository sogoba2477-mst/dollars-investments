import { NextResponse } from "next/server";
import { getAlpacaClient } from "@/lib/broker/alpaca";

export const runtime = "nodejs";

export async function GET() {
  try {
    const alpaca = getAlpacaClient();
    const positions = await alpaca.getPositions();
    return NextResponse.json(positions ?? []);
  } catch (err: any) {
    return NextResponse.json(
      { error: "BROKER_POSITIONS_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
