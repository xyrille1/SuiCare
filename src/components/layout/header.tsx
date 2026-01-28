"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/icons/logo";
import { ZeroGIndicator } from "@/components/icons/zero-g-indicator";

export function Header() {
  const [isConnected, setIsConnected] = useState(false);

  const walletAddress = "0x1a2b3c4d5e6f7g8h9i0j..."; // Mock address

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">SuiCare</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ZeroGIndicator />
          <nav className="flex items-center space-x-2">
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://www.gravatar.com/avatar?d=mp" alt="User" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Wallet</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {walletAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsConnected(false)}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setIsConnected(true)}>
                <LogIn className="mr-2 h-4 w-4" /> Connect with Google
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
