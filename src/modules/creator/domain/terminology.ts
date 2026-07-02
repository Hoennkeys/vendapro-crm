/**
 * Creator OS terminology — presentation layer only.
 * Legacy identifiers (Lead, clientId, /funil, ADMIN, etc.) remain unchanged in code and data.
 */

import type { Papel } from "@/lib/types";
import type { ParticipantRole } from "@/modules/communications/domain/entities";
import { PAGE_TITLE_SUFFIX } from "@/lib/product-branding";
import { PROJECTS_PIPELINE_ID, SALES_PIPELINE_ID } from "@/lib/pipelines/defaults";

/** Canonical Creator OS terms mapped from legacy CRM concepts */
export const CREATOR_TERMS = {
  admin: "Creator Owner",
  employee: "Team Member",
  client: "Brand",
  lead: "Partnership Opportunity",
  sale: "Campaign Revenue",
  funnel: "Campaign Pipeline",
  portal: "Brand Portal",
} as const;

/** Legacy labels preserved for compatibility shims and tests */
export const LEGACY_TERMS = {
  admin: "Admin",
  employee: "Funcionário",
  client: "Cliente",
  lead: "Lead",
  sale: "Venda",
  funnel: "Funil",
  portal: "Portal",
} as const;

export type CreatorConcept = keyof typeof CREATOR_TERMS;

export function creatorLabel(concept: CreatorConcept): string {
  return CREATOR_TERMS[concept];
}

export function legacyLabel(concept: CreatorConcept): string {
  return LEGACY_TERMS[concept];
}

/** CRM user role (Papel) display labels */
export const CRM_PAPEL_CREATOR_LABELS: Record<Papel, string> = {
  Administrador: CREATOR_TERMS.admin,
  Vendedor: CREATOR_TERMS.employee,
};

export function labelCrmPapel(papel: Papel): string {
  return CRM_PAPEL_CREATOR_LABELS[papel];
}

/** Communications participant role display labels */
export const COMMUNICATIONS_ROLE_CREATOR_LABELS: Record<ParticipantRole, string> = {
  admin: CREATOR_TERMS.admin,
  employee: CREATOR_TERMS.employee,
  client: CREATOR_TERMS.client,
  system: "Sistema",
  external: "Externo",
};

export function labelCommunicationsRole(role: ParticipantRole): string {
  return COMMUNICATIONS_ROLE_CREATOR_LABELS[role] ?? role;
}

/** Sidebar section labels */
export const SIDEBAR_SECTIONS = {
  creator: "Creator OS",
  commercial: "Campaign Revenue",
  communications: "Comunicações",
  operations: "Operações",
} as const;

/** Navigation item labels (Creator presentation over legacy routes) */
export const NAV_LABELS = {
  revenueDashboard: "Campaign Revenue",
  campaignPipeline: CREATOR_TERMS.funnel,
  agenda: "Agenda",
  chamados: "Suporte",
  faturamento: "Faturamento de Brands",
  projetos: "Projetos",
} as const;

export function creatorPageTitle(section: string): string {
  return `${section} — ${PAGE_TITLE_SUFFIX}`;
}

export function portalPageTitle(section: string): string {
  return `${section} — ${CREATOR_TERMS.portal}`;
}

/** Display name for legacy pipeline records (routes/IDs unchanged) */
export function labelPipelineDisplay(pipelineId: string, fallbackNome: string): string {
  if (pipelineId === SALES_PIPELINE_ID) return CREATOR_TERMS.funnel;
  if (pipelineId === PROJECTS_PIPELINE_ID) return NAV_LABELS.projetos;
  return fallbackNome;
}

export function labelPipelineDescription(pipelineId: string, fallback: string): string {
  if (pipelineId === SALES_PIPELINE_ID) {
    return `${CREATOR_TERMS.funnel} de ${CREATOR_TERMS.lead.toLowerCase()}s e receita de campanha.`;
  }
  return fallback;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  creator: "Creator OS",
  brands: "Marcas",
  agencies: "Agencies",
  sponsors: "Sponsors",
  campaigns: "Campanhas",
  painel: NAV_LABELS.revenueDashboard,
  funil: CREATOR_TERMS.funnel,
  agenda: "Agenda",
  communications: SIDEBAR_SECTIONS.communications,
  inbox: "Inbox",
  tickets: "Tickets",
  channels: "Canais",
  integrations: "Integrações",
  reports: "Relatórios",
  settings: "Configurações",
  chamados: "Suporte",
  faturamento: NAV_LABELS.faturamento,
  configuracoes: "Configurações",
  propostas: "Propostas",
};

/**
 * Resolves breadcrumb trail for tenant app paths.
 * Does not alter routes — labels only.
 */
export function resolveAppBreadcrumbs(pathname: string, tenantSlug: string): BreadcrumbItem[] {
  const base = `/t/${tenantSlug}/app`;
  if (!pathname.startsWith(base)) return [];

  const rest = pathname.slice(base.length).replace(/^\//, "");
  if (!rest) {
    return [{ label: NAV_LABELS.revenueDashboard, href: `${base}/painel` }];
  }

  const segments = rest.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: "Creator OS", href: `${base}/creator/` }];

  let pathAcc = base;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    pathAcc += `/${seg}`;

    if (seg === "$pipelineId" || seg.startsWith("pipeline-")) {
      const pipelineLabel =
        seg === SALES_PIPELINE_ID
          ? CREATOR_TERMS.funnel
          : seg === PROJECTS_PIPELINE_ID
            ? NAV_LABELS.projetos
            : CREATOR_TERMS.funnel;
      if (seg.startsWith("pipeline-")) {
        crumbs.push({ label: pipelineLabel, href: pathAcc });
      }
      continue;
    }

    const label =
      ROUTE_SEGMENT_LABELS[seg] ??
      (seg.match(/^pipeline-/) ? CREATOR_TERMS.funnel : seg.charAt(0).toUpperCase() + seg.slice(1));

    const isLast = i === segments.length - 1;
    crumbs.push({
      label,
      href: isLast ? undefined : pathAcc,
    });
  }

  return crumbs;
}

/** Type aliases — documentation / gradual migration; underlying types unchanged */
export type PartnershipOpportunity = import("@/lib/types").Lead;
export type BrandAccount = import("@/lib/clients-registry").ClientRecord;

export const ENTITY_ALIASES = {
  Lead: "PartnershipOpportunity (alias — type remains Lead)",
  ClientRecord: "BrandAccount (alias — registry unchanged)",
  PapelAdministrador: "CreatorOwner (alias — value remains Administrador)",
  PapelVendedor: "TeamMember (alias — value remains Vendedor)",
} as const;
