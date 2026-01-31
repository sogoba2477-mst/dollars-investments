import { NextResponse } from "next/server";
import { alpaca } from "@/lib/broker/alpaca";

export async function GET() {
  const positions = await alpaca.getPositions();
  return NextResponse.json(
    positions.map((p: any) => ({
      symbol: p.symbol,
      qty: p.qty,
      avg_entry_price: p.avg_entry_price,
      market_value: p.market_value,
      unrealized_pl: p.unrealized_pl,
    }))
  );
}
