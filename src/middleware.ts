import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Force apex (no www)
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;

  // Only protect /app routes
  if (pathname.startsWith("/app")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/((?!_next|favicon.ico|icon.ico).*)"],
};
