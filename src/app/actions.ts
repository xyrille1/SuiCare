
'use server';

import { suggestDonations } from '@/ai/suggest-donations';

export async function getDonationSuggestions(campaign: {
  title: string;
  description: string;
  goal: number;
}) {
  try {
    const response = await suggestDonations(campaign);
    return response.suggestions;
  } catch (error) {
    console.error("Error fetching donation suggestions:", error);
    // Provide a fallback in case of an error
    const fallbackAmounts = [10, 50, 100].map(amount => Math.min(amount, campaign.goal));
    return fallbackAmounts;
  }
}
