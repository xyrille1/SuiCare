import { LucideIcon } from "lucide-react";
import { CampaignStatus } from "@/lib/campaign-status";

export interface Milestone {
  description: string;
  percentage: number;
  status: number;
  releasedAmount?: number;
}

export interface Campaign {
  id: string;

  // Contract-aligned fields
  admin: string;
  name: string;
  description: string;
  recipient: string;
  targetAmount: number;
  donatedAmount: number;
  totalReleased: number;
  escrowBalance: number;
  milestones: Milestone[];

  // Legacy aliases still used in parts of UI
  title: string;
  recipientAddress: string;
  goal: number;
  raised: number;

  // UI-only fields
  status?: CampaignStatus;
  image?: string;
  color?: string;
  icon?: LucideIcon;
  iconColor?: string;
  category?: string;
}

export interface NewCampaignData {
  title: string;
  description: string;
  goal: number;
  recipientAddress: string;
  milestones?: Milestone[];
}

export interface UpdateCampaignData extends NewCampaignData {
  id: string;
}
