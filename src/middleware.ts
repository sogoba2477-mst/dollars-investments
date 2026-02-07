import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Force www -> apex, mais sans toucher à /api/auth/* (OAuth)
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Applique le middleware partout SAUF :
    // - Next.js assets
    // - favicon/icon
    // - NextAuth routes (OAuth dépend des cookies state/pkce/csrf)
    // - Toute API (optionnel mais recommandé pour éviter surprises)
    "/((?!api/auth|api/|_next|favicon.ico|icon.ico).*)",
  ],
};


