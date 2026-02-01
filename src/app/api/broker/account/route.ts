import { NextResponse } from "next/server";
import { getAlpacaClient } from "@/lib/broker/alpaca";

export async function GET() {
  const alpaca = getAlpacaClient();
  const account = await alpaca.getAccount();
  return NextResponse.json({
    id: account.id,
    status: account.status,
    currency: account.currency,
    cash: account.cash,
    portfolio_value: account.portfolio_value,
    buying_power: account.buying_power,
  });
}
