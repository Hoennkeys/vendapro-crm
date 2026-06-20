import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  MessagesSquare,
  CalendarDays,
  Headphones,
  Receipt,
  FolderKanban,
} from "lucide-react";
import { SALES_PIPELINE_ID, PROJECTS_PIPELINE_ID } from "@/lib/pipelines/defaults";

type AppNavRoute =
  | "/t/$tenantSlug/app/painel"
  | "/t/$tenantSlug/app/funil/$pipelineId"
  | "/t/$tenantSlug/app/comunicacao"
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

export const COMMERCIAL_SECTION_LABEL = "Comercial";
export const POS_VENDA_SECTION_LABEL = "Pós-Venda & Operações";

export const commercialNav: AppNavItem[] = [
  { title: "Painel", to: "/t/$tenantSlug/app/painel", icon: LayoutDashboard },
  {
    title: "Funil de Vendas",
    to: "/t/$tenantSlug/app/funil/$pipelineId",
    icon: KanbanSquare,
    pipelineId: SALES_PIPELINE_ID,
  },
  { title: "Comunicação", to: "/t/$tenantSlug/app/comunicacao", icon: MessagesSquare },
  { title: "Agenda", to: "/t/$tenantSlug/app/agenda", icon: CalendarDays },
];

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

export function isNavItemActive(pathname: string, tenantSlug: string, item: AppNavItem): boolean {
  if (isPipelineNavItem(item)) {
    return pathname.includes(`/funil/${item.pipelineId}`);
  }

  const segment = item.to.split("/").pop() ?? "";

  if (segment === "comunicacao") {
    return (
      pathname.includes(`/t/${tenantSlug}/app/comunicacao`) ||
      pathname === `/t/${tenantSlug}/app/chats` ||
      pathname === `/t/${tenantSlug}/app/emails`
    );
  }

  return pathname === `/t/${tenantSlug}/app/${segment}`;
}

export function isPosVendaRouteActive(pathname: string, tenantSlug: string): boolean {
  return posVendaNav.some((item) => isNavItemActive(pathname, tenantSlug, item));
}
