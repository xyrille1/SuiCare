"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CampaignCard, type Campaign } from "@/components/campaign-card";
import { DonationDrawer } from "@/components/donation-drawer";
import { ImpactFeed } from "@/components/impact-feed";
import { Button } from "@/components/ui/button";
import { useCampaigns } from "@/context/campaign-context";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { campaigns } = useCampaigns();

  const handleCardClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 sm:py-32 text-center container">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
            Transparent Giving: See exactly where your impact goes.
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-6">
            Stop wondering where your donations land. We’ve stripped away the overhead and the guesswork to give you a direct line to the causes you care about. From the moment you give to the second your contribution makes a difference, you’ll see the real-world results of your generosity in real time. No filters, no mystery—just pure impact. 
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild className="rounded-full">
              <Link href="#campaigns">
                Explore Campaigns
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link href="/create-campaign">Create a Campaign</Link>
            </Button>
          </div>
        </section>

        {/* Campaigns and Impact Feed Section */}
        <section id="campaigns" className="container max-w-screen-lg mx-auto pb-20 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Verified Campaigns</h2>
                <Link href="#" className="text-sm font-semibold text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} onClick={handleCardClick} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                 <ImpactFeed />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <DonationDrawer 
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        campaign={selectedCampaign}
      />
    </>
  );
}
