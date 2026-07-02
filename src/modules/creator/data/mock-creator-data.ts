import { DEMO_TENANT_ID, ACME_TENANT_ID } from "@/lib/mock-data";
import type { CreatorSnapshot } from "../domain/entities";

const demoCreator: CreatorSnapshot = {
  brands: [
    {
      id: "brand_demo_techflow",
      tenantId: DEMO_TENANT_ID,
      name: "TechFlow",
      slug: "techflow",
      niche: "Tecnologia & reviews",
      audienceSize: 420_000,
      platforms: ["youtube", "instagram", "tiktok"],
      status: "active",
      primaryAgencyId: "agency_demo_pulse",
      createdAt: "2025-11-01T10:00:00Z",
      updatedAt: "2026-06-15T10:00:00Z",
    },
    {
      id: "brand_demo_fitlife",
      tenantId: DEMO_TENANT_ID,
      name: "FitLife Diário",
      slug: "fitlife",
      niche: "Saúde & bem-estar",
      audienceSize: 185_000,
      platforms: ["instagram", "tiktok", "podcast"],
      status: "active",
      createdAt: "2026-01-10T10:00:00Z",
      updatedAt: "2026-06-01T10:00:00Z",
    },
  ],
  agencies: [
    {
      id: "agency_demo_pulse",
      tenantId: DEMO_TENANT_ID,
      name: "Pulse Creator Agency",
      contactName: "Ana Souza",
      contactEmail: "ana@pulsecreator.com",
      brandsManaged: ["brand_demo_techflow"],
      commissionRate: 15,
      status: "active",
      createdAt: "2025-10-01T10:00:00Z",
      updatedAt: "2026-05-01T10:00:00Z",
    },
  ],
  sponsors: [
    {
      id: "sponsor_demo_novatech",
      tenantId: DEMO_TENANT_ID,
      name: "NovaTech Brasil",
      industry: "Eletrônicos",
      contactEmail: "parcerias@novatech.com.br",
      budgetRange: "R$ 50k – R$ 200k",
      status: "active",
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-06-10T10:00:00Z",
    },
    {
      id: "sponsor_demo_greenfit",
      tenantId: DEMO_TENANT_ID,
      name: "GreenFit Suplementos",
      industry: "Nutrição esportiva",
      contactEmail: "creators@greenfit.com",
      budgetRange: "R$ 20k – R$ 80k",
      status: "prospect",
      createdAt: "2026-05-20T10:00:00Z",
      updatedAt: "2026-05-20T10:00:00Z",
    },
  ],
  campaigns: [
    {
      id: "campaign_demo_launch_x3",
      tenantId: DEMO_TENANT_ID,
      title: "Lançamento NovaTech X3 — TechFlow",
      brandId: "brand_demo_techflow",
      sponsorId: "sponsor_demo_novatech",
      agencyId: "agency_demo_pulse",
      status: "active",
      budget: 120_000,
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      channels: ["youtube", "instagram", "email"],
      description: "Review + unboxing + 3 reels patrocinados.",
      createdAt: "2026-05-15T10:00:00Z",
      updatedAt: "2026-06-01T10:00:00Z",
    },
    {
      id: "campaign_demo_summer_fit",
      tenantId: DEMO_TENANT_ID,
      title: "Verão FitLife 2026",
      brandId: "brand_demo_fitlife",
      sponsorId: "sponsor_demo_greenfit",
      status: "draft",
      budget: 45_000,
      startDate: "2026-07-01",
      channels: ["instagram", "tiktok"],
      description: "Desafio 30 dias com código patrocinador.",
      createdAt: "2026-06-20T10:00:00Z",
      updatedAt: "2026-06-20T10:00:00Z",
    },
  ],
};

const acmeCreator: CreatorSnapshot = {
  brands: [
    {
      id: "brand_acme_b2b",
      tenantId: ACME_TENANT_ID,
      name: "Acme Insights",
      slug: "acme-insights",
      niche: "B2B & SaaS",
      audienceSize: 62_000,
      platforms: ["linkedin", "youtube", "podcast"],
      status: "active",
      createdAt: "2026-03-01T10:00:00Z",
      updatedAt: "2026-06-01T10:00:00Z",
    },
  ],
  agencies: [],
  sponsors: [
    {
      id: "sponsor_acme_cloudbase",
      tenantId: ACME_TENANT_ID,
      name: "CloudBase ERP",
      industry: "Software B2B",
      contactEmail: "marketing@cloudbase.io",
      budgetRange: "R$ 30k – R$ 100k",
      status: "active",
      createdAt: "2026-04-01T10:00:00Z",
      updatedAt: "2026-06-01T10:00:00Z",
    },
  ],
  campaigns: [
    {
      id: "campaign_acme_webinar",
      tenantId: ACME_TENANT_ID,
      title: "Webinar Series Q3 — Acme Insights",
      brandId: "brand_acme_b2b",
      sponsorId: "sponsor_acme_cloudbase",
      status: "active",
      budget: 35_000,
      startDate: "2026-07-01",
      endDate: "2026-09-30",
      channels: ["linkedin", "email"],
      createdAt: "2026-06-01T10:00:00Z",
      updatedAt: "2026-06-15T10:00:00Z",
    },
  ],
};

export function buildMockCreatorForTenant(tenantId: string): CreatorSnapshot {
  if (tenantId === DEMO_TENANT_ID) return demoCreator;
  if (tenantId === ACME_TENANT_ID) return acmeCreator;
  return { brands: [], agencies: [], sponsors: [], campaigns: [] };
}
