import type { Campaign } from "@/lib/types";

export type CampaignStatus = "Active" | "Funded" | "Completed";

export function getCampaignStatus(
  campaign: Pick<Campaign, "donatedAmount" | "targetAmount" | "milestones">,
): CampaignStatus {
  const goalReached =
    campaign.targetAmount > 0 &&
    campaign.donatedAmount >= campaign.targetAmount;
  const hasMilestones = campaign.milestones.length > 0;
  const allMilestonesReleased =
    hasMilestones &&
    campaign.milestones.every((milestone) => milestone.status === 2);

  if (goalReached && allMilestonesReleased) {
    return "Completed";
  }

  if (goalReached) {
    return "Funded";
  }

  return "Active";
}
