"use client";

import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { WalletIndicator } from "@/components/wallet-indicator";
import { LoginButton } from "@/components/login-button";
import { GaslessModeIndicator } from "@/components/icons/zero-g-indicator";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-xl items-center">
        <Link href="/" className="flex items-center space-x-2 ml-20">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg">SuiCare</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-40">
          
          <Link href="#campaigns" className="transition-colors hover:text-foreground">Campaigns</Link>
          <Link href="#" className="transition-colors hover:text-foreground">Activity</Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 mr-0">
          <WalletIndicator />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
