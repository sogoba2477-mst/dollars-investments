import Alpaca from "@alpacahq/alpaca-trade-api";

export function getAlpacaClient() {
  const keyId = process.env.ALPACA_API_KEY;
  const secretKey = process.env.ALPACA_API_SECRET;
  const baseUrl = process.env.ALPACA_BASE_URL ?? "https://paper-api.alpaca.markets";

  if (!keyId || !secretKey) {
    throw new Error("Alpaca env vars missing: ALPACA_API_KEY / ALPACA_API_SECRET");
  }

  return new Alpaca({
    keyId,
    secretKey,
    paper: true,
    baseUrl, // IMPORTANT: sans /v2
  });
}
