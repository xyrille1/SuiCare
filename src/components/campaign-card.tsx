'use client';

import React, { useState } from "react";
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCampaigns, ADMIN_ADDRESS } from "@/context/campaign-context";
import { Campaign } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface CampaignCardProps {
  campaign: Campaign;
  onClick: (campaign: Campaign) => void;
}

const VerifiedBadge = () => (
  <div className="absolute top-4 left-4 text-xs font-bold text-green-800 bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5 border border-green-300/50">
    VERIFIED
  </div>
)

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const currentAccount = useCurrentAccount();
  const { deleteCampaign, isPending } = useCampaigns();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isAdmin = currentAccount?.address === ADMIN_ADDRESS;

  const handleDelete = () => {
    deleteCampaign(campaign.id, () => {
        setIsDeleteDialogOpen(false);
    });
  }
  
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const MIST_PER_SUI = 1_000_000_000;
  const raisedInSui = Number(campaign.raised) / MIST_PER_SUI;
  const fundingPercentage = (raisedInSui / Number(campaign.goal)) * 100;

  return (
    <>
      <Card 
        className="w-full overflow-hidden flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
        onClick={() => onClick(campaign)}
      >
        <CardHeader className="p-0">
          <div className={`relative aspect-video flex items-center justify-center ${campaign.color}`}>
              <VerifiedBadge />
              {isAdmin && (
                <div className="absolute top-2 right-2" onClick={stopPropagation}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/edit-campaign/${campaign.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Pencil />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <campaign.icon className={`w-16 h-16 ${campaign.iconColor}`} strokeWidth={1.5} />
          </div>
          <div className="p-6">
            <CardTitle className="text-xl">{campaign.title}</CardTitle>
            <CardDescription className="pt-2 line-clamp-2">{campaign.description}</CardDescription>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={stopPropagation}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{campaign.title}" campaign.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
