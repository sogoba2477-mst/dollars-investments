import Alpaca from "@alpacahq/alpaca-trade-api";

function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const alpaca = new Alpaca({
  keyId: required("ALPACA_API_KEY", process.env.ALPACA_API_KEY),
  secretKey: required("ALPACA_API_SECRET", process.env.ALPACA_API_SECRET),
  paper: true,
  baseUrl: required("ALPACA_BASE_URL", process.env.ALPACA_BASE_URL), // SANS /v2
});
