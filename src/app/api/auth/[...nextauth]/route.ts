import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

debug: true,
logger: {
  error(code, metadata) { console.error("NEXTAUTH_ERROR", code, metadata); },
  warn(code) { console.warn("NEXTAUTH_WARN", code); },
  debug(code, metadata) { console.log("NEXTAUTH_DEBUG", code, metadata); },
},
