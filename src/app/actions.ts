"use server";

import { suggestDonations } from "@/ai/suggest-donations";

export async function getDonationSuggestions(campaign: {
  title: string;
  description: string;
  goal: number;
}) {
  const fallbackAmounts = [10, 50, 100].map((amount) =>
    Math.min(amount, campaign.goal),
  );
  const hasAiKey = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  );

  if (!hasAiKey) {
    return fallbackAmounts;
  }

  try {
    const response = await suggestDonations(campaign);
    return response.suggestions;
  } catch (error) {
    console.error("Error fetching donation suggestions:", error);
    return fallbackAmounts;
  }
}
