import { NextResponse } from "next/server";
import { getAlpacaClient } from "@/lib/broker/alpaca";

export const runtime = "nodejs";

export async function GET() {
  try {
    const alpaca = getAlpacaClient();
    const account = await alpaca.getAccount();
    return NextResponse.json(account);
  } catch (err: any) {
    return NextResponse.json(
      { error: "BROKER_ACCOUNT_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
