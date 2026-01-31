import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="absolute top-0 z-20 w-full">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-white"
        >
          <Image
            src="/logo-dollars.png"
            alt="Dollars Investments Logo"
            width={30}
            height={30}
            className="rounded"
          />
          <span>
            dollars<span className="text-white/70">.investments</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="shadow-sm">
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
