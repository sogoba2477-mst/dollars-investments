import { NextResponse } from "next/server";
import { alpaca } from "@/lib/broker/alpaca";
import { z } from "zod";

const PlaceOrderSchema = z.object({
  symbol: z.string().min(1).max(10).transform((s) => s.toUpperCase()),
  qty: z.number().positive(),
  side: z.enum(["buy", "sell"]),
});

export async function GET() {
  const orders = await alpaca.getOrders({
    status: "all",
    until: undefined,
    after: undefined,
    limit: 50,
    direction: "desc",
    nested: false,
    symbols: undefined,
  });

  return NextResponse.json(
    (orders as any[]).map((o: any) => ({
      id: o.id,
      symbol: o.symbol,
      qty: o.qty,
      side: o.side,
      type: o.type,
      status: o.status,
      submitted_at: o.submitted_at,
    }))
  );
}


export async function POST(req: Request) {
  const body = await req.json();
  const parsed = PlaceOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { symbol, qty, side } = parsed.data;

  const order = await alpaca.createOrder({
    symbol,
    qty,
    side,
    type: "market",
    time_in_force: "day",
  });

  return NextResponse.json({ ok: true, order });
}
