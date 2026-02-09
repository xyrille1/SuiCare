
import { ElementType } from "react";

export interface Milestone {
    description: string;
    percentage: number;
    status: number;
}

export interface Campaign {
    id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    recipientAddress: string;
    adminAddress: string;
    escrowBalance: number;
    milestones: Milestone[];
    icon: ElementType;
    color: string;
    iconColor: string;
}

export interface NewCampaignData {
    title: string;
    description: string;
    goal: number;
    recipientAddress: string;
    milestones: {
        description: string;
        percentage: number;
    }[];
}

export interface UpdateCampaignData {
    id: string;
    title: string;
    description: string;
    goal: number;
    recipientAddress: string;
}
