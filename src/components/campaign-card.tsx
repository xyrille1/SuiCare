"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
}

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onDonate }: CampaignCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress((campaign.raised / campaign.goal) * 100), 500);
    return () => clearTimeout(timer);
  }, [campaign.raised, campaign.goal]);

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
                <span>Raised: {new Intl.NumberFormat().format(campaign.raised)} SUI</span>
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
