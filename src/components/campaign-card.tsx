"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  imageHint: string;
  recipientAddress: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onDonate }: CampaignCardProps) {
  const suiClient = useSuiClient();
  const [liveRaised, setLiveRaised] = useState(campaign.raised);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress((liveRaised / campaign.goal) * 100), 500);
    return () => clearTimeout(timer);
  }, [liveRaised, campaign.goal]);

  useEffect(() => {
    async function fetchBalance() {
      if (campaign.recipientAddress) {
        try {
          const { totalBalance } = await suiClient.getBalance({
            owner: campaign.recipientAddress,
          });
          // Balance is in MIST, convert to SUI
          const suiBalance = parseInt(totalBalance, 10) / 1_000_000_000;
          setLiveRaised(suiBalance);
        } catch (error) {
          console.error(`Failed to fetch balance for ${campaign.recipientAddress}:`, error);
          // If fetching fails, we'll just stick with the initial mock amount which is already set
        }
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [suiClient, campaign.recipientAddress]);


  return (
    <Card className="glassmorphic-card w-full overflow-hidden flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={campaign.imageUrl}
            alt={campaign.description}
            fill
            className="object-cover"
            data-ai-hint={campaign.imageHint}
          />
        </div>
        <div className="p-6 pb-2">
          <CardTitle className="text-xl">{campaign.title}</CardTitle>
          <CardDescription className="pt-2">{campaign.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-2">
        <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Raised: {new Intl.NumberFormat().format(liveRaised)} SUI</span>
                <span>Goal: {new Intl.NumberFormat().format(campaign.goal)} SUI</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" variant="default" onClick={() => onDonate(campaign)}>
          Donate Now
        </Button>
      </CardFooter>
    </Card>
  );
}
