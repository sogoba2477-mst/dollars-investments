import { NextRequest, NextResponse } from "next/server";

const APEX = "dollars.investments";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // Ne jamais interférer avec NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Si ce n'est pas l'apex, redirige tout vers l'apex
  // (inclut www. et aussi *.vercel.app)
  if (host && host !== APEX) {
    const url = req.nextUrl.clone();
    url.host = APEX;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.ico).*)"],
};
