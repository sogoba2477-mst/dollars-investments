import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // redirect www -> apex
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // IMPORTANT: exclude ALL /api routes (especially /api/auth/*)
  matcher: ["/((?!api|_next|favicon.ico|icon.ico).*)"],
};
