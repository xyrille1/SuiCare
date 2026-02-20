"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCampaigns } from "@/context/campaign-context";
import { Campaign } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface CampaignCardProps {
  campaign: Campaign;
  onClick: (campaign: Campaign) => void;
}

const VerifiedBadge = () => (
  <div className="absolute top-4 left-4 text-xs font-bold text-green-800 bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5 border border-green-300/50 z-10">
    VERIFIED
  </div>
);

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const currentAccount = useCurrentAccount();
  const { deleteCampaign, isPending } = useCampaigns();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- LOGIC ---
  // 1. Check if current user is the admin
  const isCampaignAdmin = currentAccount?.address === campaign.admin;

  // 2. Check logic constraints
  const canEdit = campaign.totalReleased === 0;
  const hasFunds = campaign.escrowBalance > 0;

  // --- HANDLERS ---
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop card click
    deleteCampaign(campaign.id, () => {
      setIsDeleteDialogOpen(false);
    });
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const MIST_PER_SUI = 1_000_000_000;
  const raisedInSui = Number(campaign.raised) / MIST_PER_SUI;
  const fundingPercentage = (raisedInSui / Number(campaign.goal)) * 100;

  return (
    <>
      <Card
        className="w-full overflow-hidden flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-md group h-full"
        onClick={() => onClick(campaign)}
      >
        <CardHeader className="p-0 relative">
          {/* IMAGE AREA */}
          <div
            className={`relative aspect-video flex items-center justify-center ${
              campaign.color || "bg-gray-100"
            }`}
          >
            <VerifiedBadge />

            {/* --- KEBAB MENU (Top Right) --- */}
            {/* Only visible to the Admin */}
            {isCampaignAdmin && (
              <div
                className="absolute top-3 right-3 z-20"
                onClick={stopPropagation}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/40 hover:bg-white/90 text-gray-800 backdrop-blur-md transition-all shadow-sm"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Manage Campaign</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* EDIT OPTION */}
                    {canEdit ? (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/edit-campaign/${campaign.id}`}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Edit Details</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-2 opacity-60"
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Cannot Edit (Active)</span>
                      </DropdownMenuItem>
                    )}

                    {/* DELETE OPTION */}
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center gap-2"
                      onSelect={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Campaign</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Icon Rendering */}
            {campaign.icon ? (
              <campaign.icon
                className={`w-16 h-16 ${campaign.iconColor || "text-gray-500"}`}
                strokeWidth={1.5}
              />
            ) : (
              <div className="text-4xl font-bold opacity-20 select-none">
                {(campaign.name || "C").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* CONTENT AREA */}
          <div className="p-6">
            <CardTitle className="text-xl">
              {campaign.name || campaign.title || "Untitled Campaign"}
            </CardTitle>
            <CardDescription className="pt-2 line-clamp-2 min-h-[40px]">
              {campaign.description}
            </CardDescription>
            <div className="pt-4">
              <Progress value={fundingPercentage} className="h-2" />
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm font-semibold">${raisedInSui.toLocaleString()} <span className="text-muted-foreground font-normal">raised</span></p>
                <p className="text-sm text-muted-foreground"><span className="font-semibold">${Number(campaign.goal).toLocaleString()}</span> goal</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* DELETE DIALOG */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent onClick={stopPropagation}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Campaign?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-4 py-2">
              <span className="text-base text-foreground">
                This action is <strong>irreversible</strong>. The campaign{" "}
                <span className="font-semibold text-black">
                  "{campaign.name}"
                </span>{" "}
                will be permanently removed.
              </span>

              {/* Warning if funds exist */}
              {hasFunds && (
                <div className="flex items-start gap-3 p-3 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-amber-900">
                      Refund Required
                    </span>
                    <span>
                      This campaign holds{" "}
                      <strong>
                        {(campaign.escrowBalance / 1_000_000_000).toFixed(2)}{" "}
                        SUI
                      </strong>
                      . Deleting it will automatically refund these funds to
                      your wallet.
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={stopPropagation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Yes, Delete Campaign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
