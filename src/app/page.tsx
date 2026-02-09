'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CampaignCard } from '@/components/campaign-card';
import type { Campaign } from '@/lib/types';
import { DonationDrawer } from '@/components/donation-drawer';
import { ImpactFeed } from '@/components/impact-feed';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/context/campaign-context';
import { Zap, Heart, Loader2, PlusCircle, AlertTriangle } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_SUI_ADMIN_ADDRESS!;

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const { campaigns, isLoaded, error } = useCampaigns();
  const currentAccount = useCurrentAccount();

  const handleCardClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  };

  const renderCampaigns = () => {
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Data Fetching Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (campaigns.length === 0) {
        return (
          <div className="text-center bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-gray-500 mb-4">Be the first to create a campaign and start making a difference!</p>
            <Button asChild>
              <Link href="/create-campaign">Create a Campaign</Link>
            </Button>
          </div>
        );
      }

    return (
      <div className="grid sm:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={handleCardClick}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white via-white to-[#F0FAF9]">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 px-8">
            {/* Left Column */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center bg-[#E0F3E0] text-[#14B8A6] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <Zap className="h-4 w-4 mr-1.5" />
                DECENTRALIZED DONATION
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-[#1A202C]">
                SuiCare:
                <br />
                <span className="text-[#14B8A6]">Transparent Giving</span>
              </h1>
              <p className="mt-6 text-lg text-gray-500 max-w-lg">
                Stop wondering where your donations land. We\'ve stripped away the
                overhead and the guesswork to give you a direct line to the
                causes you care about.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="rounded-full !bg-[#1A202C] text-white hover:!bg-gray-800 px-8 py-6 text-base font-semibold"
                >
                  <Link href="#campaigns">Explore Campaigns</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full bg-white px-8 py-6 text-base font-semibold border-gray-200 hover:bg-gray-50"
                >
                  <Link href="/create-campaign">Create Campaign</Link>
                </Button>
              </div>
              <div className="mt-16 grid grid-cols-3 gap-4 text-left w-full max-w-lg">
                <div className="pr-4 border-r border-gray-200">
                  <p className="text-4xl font-bold">12k+</p>
                  <p className="text-sm text-gray-500">Donors</p>
                </div>
                <div className="px-4 border-r border-gray-200">
                  <p className="text-4xl font-bold">$2.4M</p>
                  <p className="text-sm text-gray-500">Raised</p>
                </div>
                <div className="pl-4">
                  <p className="text-4xl font-bold">100%</p>
                  <p className="text-sm text-gray-500">Transparent</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                alt="Donation drive"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl object-cover"
              />
              <div className="absolute -top-4 -right-0 bg-[#B2FFD6] p-4 rounded-2xl shadow-lg">
                <Heart className="h-8 w-8 text-[#14B8A6]" />
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns and Impact Feed Section */}
        <section
          id="campaigns"
          className="container max-w-screen-xl mx-auto pb-20 scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">
                        Verified Campaigns
                        {isLoaded && campaigns.length > 0 && (
                            <span className="text-gray-500 font-light ml-2">({campaigns.length})</span>
                        )}
                    </h2>
                    <div className="flex items-center space-x-4">
                        {currentAccount && currentAccount.address === ADMIN_ADDRESS && (
                            <Button variant="outline" asChild>
                                <Link href={{ pathname: '/add-milestone', query: { campaignId: campaigns[0]?.id } }} className="flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Add Milestone
                                </Link>
                            </Button>
                        )}
                        <Link
                        href="#campaigns"
                        className="text-sm font-semibold text-primary hover:underline"
                        >
                        View all
                        </Link>
                    </div>
                </div>
              {renderCampaigns()}
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <ImpactFeed />
              </div>
            </div>
          </div>
        </section>
      </main>
      <DonationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        campaign={selectedCampaign}
      />
    </>
  );
}
