"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { GaslessModeIndicator } from "@/components/icons/zero-g-indicator";

export function WalletIndicator() {
  const account = useCurrentAccount();

  if (!account) {
    return null;
  }

  return <GaslessModeIndicator />;
}
