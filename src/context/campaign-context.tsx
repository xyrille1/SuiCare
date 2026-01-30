"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BookOpen, Droplet, HeartHandshake, Package, LucideProps } from "lucide-react";
import React from 'react';

const CAMPAIGNS_STORAGE_KEY = 'suicare-campaigns';
export const ADMIN_ADDRESS = "0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6";


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

const icons = [
  { icon: Droplet, color: "bg-blue-100", iconColor: "text-blue-500" },
  { icon: Package, color: "bg-orange-100", iconColor: "text-orange-500" },
  { icon: BookOpen, color: "bg-green-100", iconColor: "text-green-500" },
  { icon: HeartHandshake, color: "bg-pink-100", iconColor: "text-pink-500" },
];

const initialCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Clean Water for Africa",
    description: "Every coin counts toward a life-changing drop of clean water for communities in need.",
    goal: 50000,
    raised: 0,
    recipientAddress: "0x1111111111111111111111111111111111111111111111111111111111111111",
    icon: Droplet,
    color: "bg-cyan-100/50",
    iconColor: "text-cyan-600",
  },
  {
    id: "2",
    title: "Community Food Drive",
    description: "Volunteers sorting food donations at a community center.",
    goal: 75000,
    raised: 0,
    recipientAddress: "0x2222222222222222222222222222222222222222222222222222222222222222",
    icon: Package,
    color: "bg-blue-100/50",
    iconColor: "text-blue-600",
  },
  {
    id: "3",
    title: "Children's Education Fund",
    description: "Support underprivileged children with school supplies and tutoring to unlock their full potential.",
    goal: 100000,
    raised: 0,
    recipientAddress: "0x3333333333333333333333333333333333333333333333333333333333333333",
    icon: BookOpen,
    color: "bg-emerald-100/50",
    iconColor: "text-emerald-600",
  },
    {
    id: "4",
    title: "Emergency Disaster Relief",
    description: "Provide immediate aid, shelter, and medical supplies to victims of recent natural disasters.",
    goal: 25000,
    raised: 0,
    recipientAddress: "0x4444444444444444444444444444444444444444444444444444444444444444",
    icon: HeartHandshake,
    color: "bg-rose-100/50",
    iconColor: "text-rose-600",
  },
];

export type NewCampaignData = Omit<Campaign, 'id' | 'raised' | 'icon' | 'color' | 'iconColor'>;
export type UpdateCampaignData = Omit<Campaign, 'raised' | 'icon' | 'color' | 'iconColor'>;

interface CampaignContextType {
  campaigns: Campaign[];
  isLoaded: boolean;
  addCampaign: (campaign: NewCampaignData) => void;
  getCampaignById: (id: string) => Campaign | undefined;
  updateCampaign: (campaign: UpdateCampaignData) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns).map((c: any) => {
          // This is a bit of a hack to restore the icon component from its name
          const iconData = icons.find(ic => ic.icon.displayName === c.iconName) || icons[0];
          return { ...c, icon: iconData.icon };
        }));
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

  useEffect(() => {
    if (isLoaded) {
      try {
        // Prepare for JSON serialization
        const campaignsToStore = campaigns.map(c => ({...c, iconName: c.icon.displayName}));
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaignsToStore));
      } catch (error) {
        console.error("Failed to save campaigns to localStorage", error);
      }
    }
  }, [campaigns, isLoaded]);

  const addCampaign = (newCampaignData: NewCampaignData) => {
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      raised: 0,
      ...randomIcon,
      ...newCampaignData,
    };
    setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
  };

  const updateCampaign = (updatedCampaignData: UpdateCampaignData) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(c => {
        if (c.id === updatedCampaignData.id) {
          return {
            ...c,
            ...updatedCampaignData,
          };
        }
        return c;
      })
    );
  };
  
  const deleteCampaign = (id: string) => {
    setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== id));
  };


  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const value = { campaigns, isLoaded, addCampaign, getCampaignById, updateCampaign, deleteCampaign };

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
