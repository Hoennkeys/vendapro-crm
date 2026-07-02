import * as React from "react";
import { useCrm } from "@/lib/crm-store";
import { useTenant } from "@/lib/tenant/tenant-store";
import type { CampaignStatus, CreatorSnapshot } from "../domain/entities";

type CreatorContextValue = {
  tenantId: string;
  snapshot: CreatorSnapshot;
  brands: CreatorSnapshot["brands"];
  agencies: CreatorSnapshot["agencies"];
  sponsors: CreatorSnapshot["sponsors"];
  campaigns: CreatorSnapshot["campaigns"];
  atualizarCampaignStatus: (id: string, status: CampaignStatus) => void;
};

const CreatorContext = React.createContext<CreatorContextValue | null>(null);

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const { whiteLabel } = useTenant();
  const crm = useCrm();
  const tenantId = whiteLabel.tenantId;
  const snapshot = crm.getCreator();

  const value: CreatorContextValue = {
    tenantId,
    snapshot,
    brands: snapshot.brands.filter((b) => b.tenantId === tenantId),
    agencies: snapshot.agencies.filter((a) => a.tenantId === tenantId),
    sponsors: snapshot.sponsors.filter((s) => s.tenantId === tenantId),
    campaigns: snapshot.campaigns.filter((c) => c.tenantId === tenantId),
    atualizarCampaignStatus: crm.atualizarCampaignStatus,
  };

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
}

export function useCreator() {
  const ctx = React.useContext(CreatorContext);
  if (!ctx) throw new Error("useCreator precisa de CreatorProvider");
  return ctx;
}
