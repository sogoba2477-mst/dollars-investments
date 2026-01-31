import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AppHome() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium">{session?.user?.email ?? "unknown"}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Balance</div>
          <div className="mt-2 text-sm text-muted-foreground">—</div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Positions</div>
          <div className="mt-2 text-sm text-muted-foreground">—</div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-medium">Orders</div>
          <div className="mt-2 text-sm text-muted-foreground">—</div>
        </div>
      </div>
    </div>
  );
}
