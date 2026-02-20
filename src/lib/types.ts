import { LucideIcon } from "lucide-react";

export interface Campaign {
  id: string;

  // --- New Fields Required by the Contract ---
  admin: string; // The address of the campaign creator
  name: string; // Matches 'name' in your Move contract
  totalReleased: number; // Matches 'total_released' (needed for Edit check)
  escrowBalance: number; // The balance of the 'escrow' object (needed for Delete check)
  recipient: string; // The address of the recipient

  // --- Existing Fields ---
  title?: string; // Optional fallback for name
  description: string;
  targetAmount: number;
  donatedAmount: number;

  // --- UI Fields ---
  image?: string;
  color?: string;
  icon?: LucideIcon;
  iconColor?: string;
  category?: string;
}
