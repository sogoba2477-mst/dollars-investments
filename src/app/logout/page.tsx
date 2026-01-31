"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="mx-auto max-w-md py-20 text-muted-foreground">
      Signing you out…
    </div>
  );
}
