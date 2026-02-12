import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserId() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) throw new Error("UNAUTHORIZED");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");

  return user.id;
}
