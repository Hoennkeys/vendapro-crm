import type { Campaign, CreatorSnapshot } from "./entities";

export interface CreatorDashboardMetrics {
  activeBrands: number;
  activeAgencies: number;
  activeSponsors: number;
  activeCampaigns: number;
  totalCampaignBudget: number;
  campaignsByStatus: Record<Campaign["status"], number>;
}

export function computeCreatorMetrics(snapshot: CreatorSnapshot): CreatorDashboardMetrics {
  const campaignsByStatus = {
    draft: 0,
    active: 0,
    paused: 0,
    completed: 0,
  } as Record<Campaign["status"], number>;

  for (const campaign of snapshot.campaigns) {
    campaignsByStatus[campaign.status]++;
  }

  return {
    activeBrands: snapshot.brands.filter((b) => b.status === "active").length,
    activeAgencies: snapshot.agencies.filter((a) => a.status === "active").length,
    activeSponsors: snapshot.sponsors.filter((s) => s.status === "active").length,
    activeCampaigns: snapshot.campaigns.filter((c) => c.status === "active").length,
    totalCampaignBudget: snapshot.campaigns
      .filter((c) => c.status === "active" || c.status === "draft")
      .reduce((acc, c) => acc + c.budget, 0),
    campaignsByStatus,
  };
}
