import { NextResponse } from "next/server";

// Middleware disabled (Edge-safe no-op)
export function middleware() {
  return NextResponse.next();
}

// IMPORTANT: empty matcher => middleware never runs
export const config = {
  matcher: [],
};
