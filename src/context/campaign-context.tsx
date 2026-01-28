"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Campaign } from '@/components/campaign-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const CAMPAIGNS_STORAGE_KEY = 'suicare-campaigns';

const initialCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Community Food Drive",
    description: "Help us provide essential meals to families in need. Every SUI counts towards a hunger-free community.",
    goal: 50000,
    raised: 0,
    recipientAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    ...PlaceHolderImages.find(p => p.id === 'community-food-drive')!
  },
  {
    id: "2",
    title: "Children's Education Fund",
    description: "Support underprivileged children with school supplies and tutoring to unlock their full potential.",
    goal: 75000,
    raised: 0,
    recipientAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
    ...PlaceHolderImages.find(p => p.id === 'childrens-education-fund')!
  },
  {
    id: "3",
    title: "Emergency Disaster Relief",
    description: "Provide immediate aid, shelter, and medical supplies to victims of recent natural disasters.",
    goal: 100000,
    raised: 0,
    recipientAddress: "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    ...PlaceHolderImages.find(p => p.id === 'disaster-relief-shelter')!
  },
    {
    id: "4",
    title: "Clean Water Project",
    description: "Fund the construction of wells in remote villages, bringing clean and safe drinking water to hundreds.",
    goal: 25000,
    raised: 0,
    recipientAddress: "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    ...PlaceHolderImages.find(p => p.id === 'clean-water-project')!
  },
];

export type NewCampaignData = Omit<Campaign, 'id' | 'imageUrl' | 'imageHint' | 'raised'>;
export type UpdateCampaignData = Pick<Campaign, 'id' | 'title' | 'description' | 'goal' | 'recipientAddress'>;

interface CampaignContextType {
  campaigns: Campaign[];
  isLoaded: boolean;
  addCampaign: (campaign: NewCampaignData) => void;
  deleteCampaign: (id: string) => void;
  updateCampaign: (campaign: UpdateCampaignData) => void;
  getCampaignById: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns));
      } else {
        setCampaigns(initialCampaigns);
      }
    } catch (error) {
      console.error("Failed to parse campaigns from localStorage", error);
      setCampaigns(initialCampaigns);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever campaigns change, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      // A simple check to see if we're different from the initial hardcoded data
      if (JSON.stringify(campaigns) !== JSON.stringify(initialCampaigns) || campaigns.length !== initialCampaigns.length) {
        try {
          localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
        } catch (error) {
          console.error("Failed to save campaigns to localStorage", error);
        }
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

  const deleteCampaign = (id: string) => {
    setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== id));
  };
  
  const updateCampaign = (updatedCampaignData: UpdateCampaignData) => {
      setCampaigns(prevCampaigns =>
          prevCampaigns.map(c =>
              c.id === updatedCampaignData.id ? { ...c, ...updatedCampaignData } : c
          )
      );
  };

  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const value = { campaigns, isLoaded, addCampaign, deleteCampaign, updateCampaign, getCampaignById };

  return (
    <CampaignContext.Provider value={value}>
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
