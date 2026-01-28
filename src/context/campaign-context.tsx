"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Campaign } from '@/components/campaign-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const CAMPAIGNS_STORAGE_KEY = 'suicare-campaigns';

const initialCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Community Food Drive",
    description: "Help us provide essential meals to families in need. Every SUI counts towards a hunger-free community.",
    goal: 50000,
    raised: 32540,
    recipientAddress: "0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6",
    ...PlaceHolderImages.find(p => p.id === 'community-food-drive')!
  },
  {
    id: "2",
    title: "Children's Education Fund",
    description: "Support underprivileged children with school supplies and tutoring to unlock their full potential.",
    goal: 75000,
    raised: 21880,
    recipientAddress: "0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6",
    ...PlaceHolderImages.find(p => p.id === 'childrens-education-fund')!
  },
  {
    id: "3",
    title: "Emergency Disaster Relief",
    description: "Provide immediate aid, shelter, and medical supplies to victims of recent natural disasters.",
    goal: 100000,
    raised: 89210,
    recipientAddress: "0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6",
    ...PlaceHolderImages.find(p => p.id === 'disaster-relief-shelter')!
  },
    {
    id: "4",
    title: "Clean Water Project",
    description: "Fund the construction of wells in remote villages, bringing clean and safe drinking water to hundreds.",
    goal: 25000,
    raised: 11300,
    recipientAddress: "0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6",
    ...PlaceHolderImages.find(p => p.id === 'clean-water-project')!
  },
];

type NewCampaignData = Omit<Campaign, 'id' | 'imageUrl' | 'imageHint' | 'raised'>;

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: NewCampaignData) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns));
      }
    } catch (error) {
      console.error("Failed to parse campaigns from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever campaigns change, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
      } catch (error) {
        console.error("Failed to save campaigns to localStorage", error);
      }
    }
  }, [campaigns, isLoaded]);

  const addCampaign = (newCampaignData: NewCampaignData) => {
    const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      raised: 0,
      imageUrl: randomImage.imageUrl,
      imageHint: randomImage.imageHint,
      ...newCampaignData,
    };
    setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
  };

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}
