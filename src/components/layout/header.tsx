"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import { Logo } from "@/components/icons/logo";
import { GaslessModeIndicator } from "@/components/icons/zero-g-indicator";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-xl items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg">SuiCare</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-muted-foreground ml-10">
          <GaslessModeIndicator />
          <Link href="#campaigns" className="transition-colors hover:text-foreground">Campaigns</Link>
          <Link href="#" className="transition-colors hover:text-foreground">Activity</Link>
        </nav>

        <div className="ml-auto">
          <ConnectButton className="!bg-gray-900 !text-white !font-semibold !rounded-lg" />
        </div>
      </div>
    </header>
  );
}
