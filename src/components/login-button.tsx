"use client";

import { ConnectButton } from "@mysten/dapp-kit";

export function LoginButton() {
  return (
    <ConnectButton
      connectText="Connect Wallet"
      className="!bg-gray-900 !text-white !rounded-full hover:!bg-gray-800"
    />
  );
}
