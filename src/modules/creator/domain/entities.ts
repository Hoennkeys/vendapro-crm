export type BrandStatus = "active" | "paused" | "archived";
export type AgencyStatus = "active" | "inactive";
export type SponsorStatus = "prospect" | "active" | "inactive";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type CreatorPlatform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitch"
  | "linkedin"
  | "podcast";

export interface Brand {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  niche: string;
  audienceSize: number;
  platforms: CreatorPlatform[];
  status: BrandStatus;
  logoUrl?: string;
  primaryAgencyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  tenantId: string;
  name: string;
  contactName: string;
  contactEmail: string;
  brandsManaged: string[];
  commissionRate: number;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  tenantId: string;
  name: string;
  industry: string;
  contactEmail: string;
  budgetRange: string;
  status: SponsorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  title: string;
  brandId: string;
  sponsorId?: string;
  agencyId?: string;
  status: CampaignStatus;
  budget: number;
  startDate: string;
  endDate?: string;
  channels: string[];
  /** Optional link to Communications Hub conversation */
  conversationId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorSnapshot {
  brands: Brand[];
  agencies: Agency[];
  sponsors: Sponsor[];
  campaigns: Campaign[];
}

export const EMPTY_CREATOR_SNAPSHOT: CreatorSnapshot = {
  brands: [],
  agencies: [],
  sponsors: [],
  campaigns: [],
};
