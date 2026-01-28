"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CampaignCard, type Campaign } from "@/components/campaign-card";
import { DonationDrawer } from "@/components/donation-drawer";
import { ImpactFeed } from "@/components/impact-feed";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Community Food Drive",
    description: "Help us provide essential meals to families in need. Every SUI counts towards a hunger-free community.",
    goal: 50000,
    raised: 32540,
    ...PlaceHolderImages.find(p => p.id === 'community-food-drive')!
  },
  {
    id: "2",
    title: "Children's Education Fund",
    description: "Support underprivileged children with school supplies and tutoring to unlock their full potential.",
    goal: 75000,
    raised: 21880,
    ...PlaceHolderImages.find(p => p.id === 'childrens-education-fund')!
  },
  {
    id: "3",
    title: "Emergency Disaster Relief",
    description: "Provide immediate aid, shelter, and medical supplies to victims of recent natural disasters.",
    goal: 100000,
    raised: 89210,
    ...PlaceHolderImages.find(p => p.id === 'disaster-relief-shelter')!
  },
    {
    id: "4",
    title: "Clean Water Project",
    description: "Fund the construction of wells in remote villages, bringing clean and safe drinking water to hundreds.",
    goal: 25000,
    raised: 11300,
    ...PlaceHolderImages.find(p => p.id === 'clean-water-project')!
  },
];


export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const handleDonateClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center container">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Transparent Giving, Zero Fees.
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
            SuiCare is a peer-to-peer donation platform on the Sui blockchain. Give directly to those in need by connecting your wallet and donating on the testnet.
          </p>
          <div className="mt-8">
            <Button size="lg">Explore Campaigns</Button>
          </div>
        </section>

        {/* Campaigns and Impact Feed Section */}
        <section className="container max-w-screen-2xl mx-auto pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Verified Campaigns</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {mockCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} onDonate={handleDonateClick} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Live Activity</h2>
              <ImpactFeed />
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
