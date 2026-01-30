"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideProps } from "lucide-react";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  recipientAddress: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  color: string;
  iconColor: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onClick: (campaign: Campaign) => void;
}

const VerifiedBadge = () => (
  <div className="absolute top-4 right-4 text-xs font-bold text-green-800 bg-white/70 backdrop-blur-sm rounded-full px-2 py-0.5 border border-green-300/50">
    VERIFIED
  </div>
)

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {

  return (
    <Card 
      className="w-full overflow-hidden flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => onClick(campaign)}
    >
      <CardHeader className="p-0">
        <div className={`relative aspect-video flex items-center justify-center ${campaign.color}`}>
            <VerifiedBadge />
            <campaign.icon className={`w-16 h-16 ${campaign.iconColor}`} strokeWidth={1.5} />
        </div>
        <div className="p-6">
          <CardTitle className="text-xl">{campaign.title}</CardTitle>
          <CardDescription className="pt-2 line-clamp-2">{campaign.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
