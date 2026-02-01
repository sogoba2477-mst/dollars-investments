import { NextResponse } from "next/server";
import { z } from "zod";
import { getAlpacaClient } from "@/lib/broker/alpaca";

export const runtime = "nodejs"; // important: lib Alpaca + secrets côté serveur

const PlaceOrderSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  qty: z.coerce.number().int().positive().max(100000),
  side: z.enum(["buy", "sell"]),
  type: z.literal("market"),
  time_in_force: z.enum(["day", "gtc"]).default("day"),
});

export async function GET() {
  try {
    const alpaca = getAlpacaClient();

    // Types Alpaca parfois exigeants → on passe les champs optionnels
    const orders = await alpaca.getOrders({
      status: "all",
      limit: 50,
      direction: "desc",
      // champs optionnels requis par certains types TS
      after: undefined,
      until: undefined,
      nested: undefined,
      symbols: undefined,
    } as any);

    return NextResponse.json(orders ?? []);
  } catch (err: any) {
    return NextResponse.json(
      { error: "BROKER_ORDERS_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const alpaca = getAlpacaClient();
    const json = await req.json();
    const data = PlaceOrderSchema.parse(json);

    const order = await alpaca.createOrder({
      symbol: data.symbol,
      qty: data.qty,
      side: data.side,
      type: data.type,
      time_in_force: data.time_in_force,
    } as any);

    return NextResponse.json(order);
  } catch (err: any) {
    const zodError = err?.issues ? err : null;
    if (zodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", issues: err.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "BROKER_PLACE_ORDER_FAILED", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
