import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Headphones,
  Receipt,
  FolderKanban,
  Inbox,
  Ticket,
  Radio,
  Plug,
  BarChart3,
  Settings2,
  MessagesSquare,
  Sparkles,
  Building2,
  Handshake,
  Target,
  Megaphone,
} from "lucide-react";
import { SALES_PIPELINE_ID, PROJECTS_PIPELINE_ID } from "@/lib/pipelines/defaults";

type AppNavRoute =
  | "/t/$tenantSlug/app/creator/"
  | "/t/$tenantSlug/app/creator/brands"
  | "/t/$tenantSlug/app/creator/agencies"
  | "/t/$tenantSlug/app/creator/sponsors"
  | "/t/$tenantSlug/app/creator/campaigns"
  | "/t/$tenantSlug/app/painel"
  | "/t/$tenantSlug/app/funil/$pipelineId"
  | "/t/$tenantSlug/app/comunicacao"
  | "/t/$tenantSlug/app/communications/inbox"
  | "/t/$tenantSlug/app/communications/tickets"
  | "/t/$tenantSlug/app/communications/channels"
  | "/t/$tenantSlug/app/communications/integrations"
  | "/t/$tenantSlug/app/communications/reports"
  | "/t/$tenantSlug/app/communications/settings"
  | "/t/$tenantSlug/app/agenda"
  | "/t/$tenantSlug/app/chamados"
  | "/t/$tenantSlug/app/faturamento";

export type AppNavLink = {
  title: string;
  to: AppNavRoute;
  icon: LucideIcon;
};

export type AppNavPipelineLink = AppNavLink & {
  pipelineId: string;
};

export type AppNavItem = AppNavLink | AppNavPipelineLink;

export const CREATOR_SECTION_LABEL = "Creator OS";
/** CRM legado — mantido durante migração */
export const COMMERCIAL_SECTION_LABEL = "CRM Comercial";
export const COMMUNICATIONS_SECTION_LABEL = "Comunicações";
export const POS_VENDA_SECTION_LABEL = "Pós-Venda & Operações";

export const creatorNav: AppNavItem[] = [
  { title: "Overview", to: "/t/$tenantSlug/app/creator/", icon: Sparkles },
  { title: "Marcas", to: "/t/$tenantSlug/app/creator/brands", icon: Building2 },
  { title: "Agencies", to: "/t/$tenantSlug/app/creator/agencies", icon: Handshake },
  { title: "Sponsors", to: "/t/$tenantSlug/app/creator/sponsors", icon: Target },
  { title: "Campanhas", to: "/t/$tenantSlug/app/creator/campaigns", icon: Megaphone },
];

export const commercialNav: AppNavItem[] = [
  { title: "Painel", to: "/t/$tenantSlug/app/painel", icon: LayoutDashboard },
  {
    title: "Funil de Vendas",
    to: "/t/$tenantSlug/app/funil/$pipelineId",
    icon: KanbanSquare,
    pipelineId: SALES_PIPELINE_ID,
  },
  { title: "Agenda", to: "/t/$tenantSlug/app/agenda", icon: CalendarDays },
];

export const communicationsNav: AppNavItem[] = [
  { title: "Inbox", to: "/t/$tenantSlug/app/communications/inbox", icon: Inbox },
  { title: "Tickets", to: "/t/$tenantSlug/app/communications/tickets", icon: Ticket },
  { title: "Canais", to: "/t/$tenantSlug/app/communications/channels", icon: Radio },
  {
    title: "Integrações",
    to: "/t/$tenantSlug/app/communications/integrations",
    icon: Plug,
  },
  { title: "Relatórios", to: "/t/$tenantSlug/app/communications/reports", icon: BarChart3 },
  {
    title: "Configurações",
    to: "/t/$tenantSlug/app/communications/settings",
    icon: Settings2,
  },
];

/** @deprecated Use communicationsNav — redirect compatível em /comunicacao */
export const legacyComunicacaoNavItem: AppNavLink = {
  title: "Comunicação",
  to: "/t/$tenantSlug/app/comunicacao",
  icon: MessagesSquare,
};

export const posVendaNav: AppNavItem[] = [
  { title: "Chamados", to: "/t/$tenantSlug/app/chamados", icon: Headphones },
  { title: "Faturamento", to: "/t/$tenantSlug/app/faturamento", icon: Receipt },
  {
    title: "Projetos",
    to: "/t/$tenantSlug/app/funil/$pipelineId",
    icon: FolderKanban,
    pipelineId: PROJECTS_PIPELINE_ID,
  },
];

export function isPipelineNavItem(item: AppNavItem): item is AppNavPipelineLink {
  return "pipelineId" in item;
}

export function isCreatorRoute(pathname: string, tenantSlug: string): boolean {
  return pathname.includes(`/t/${tenantSlug}/app/creator`);
}

export function isCommunicationsRoute(pathname: string, tenantSlug: string): boolean {
  const base = `/t/${tenantSlug}/app`;
  return (
    pathname.includes(`${base}/communications`) ||
    pathname.includes(`${base}/comunicacao`) ||
    pathname === `${base}/chats` ||
    pathname === `${base}/emails`
  );
}

export function isNavItemActive(pathname: string, tenantSlug: string, item: AppNavItem): boolean {
  if (isPipelineNavItem(item)) {
    return pathname.includes(`/funil/${item.pipelineId}`);
  }

  const segment = item.to.split("/").pop() ?? "";

  if (segment === "comunicacao") {
    return isCommunicationsRoute(pathname, tenantSlug);
  }

  if (item.to.includes("/communications/")) {
    return pathname.startsWith(`/t/${tenantSlug}/app/communications/${segment}`);
  }

  if (item.to.includes("/creator")) {
    if (item.to.endsWith("/creator/")) {
      return (
        pathname === `/t/${tenantSlug}/app/creator` ||
        pathname === `/t/${tenantSlug}/app/creator/`
      );
    }
    return pathname.startsWith(`/t/${tenantSlug}/app/creator/${segment}`);
  }

  return pathname === `/t/${tenantSlug}/app/${segment}` ||
    pathname.startsWith(`/t/${tenantSlug}/app/${segment}/`);
}

export function isPosVendaRouteActive(pathname: string, tenantSlug: string): boolean {
  return posVendaNav.some((item) => isNavItemActive(pathname, tenantSlug, item));
}

export function isCreatorNavActive(pathname: string, tenantSlug: string): boolean {
  return isCreatorRoute(pathname, tenantSlug);
}

export function isCommunicationsNavActive(pathname: string, tenantSlug: string): boolean {
  return isCommunicationsRoute(pathname, tenantSlug);
}
