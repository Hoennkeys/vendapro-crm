import * as React from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  Sparkles,
  Building2,
  Handshake,
  Megaphone,
  Target,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCommunicationsUnread } from "@/hooks/use-communications-unread";
import { brl } from "@/lib/format";
import { computeCreatorMetrics } from "../domain/metrics";
import { useCreator } from "../store/creator-context";
import { DashboardStatCard } from "./dashboard-stat-card";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  draft: "Rascunho",
  paused: "Pausada",
  completed: "Concluída",
};

export function CreatorDashboard() {
  const { tenantSlug } = useParams({ from: "/t/$tenantSlug/app/creator" });
  const { snapshot, brands, campaigns, sponsors, agencies } = useCreator();
  const metrics = React.useMemo(() => computeCreatorMetrics(snapshot), [snapshot]);
  const commsUnread = useCommunicationsUnread();

  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Creator OS
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão unificada de marcas, parcerias e campanhas — com CRM e Communications Hub integrados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Marcas ativas"
          value={metrics.activeBrands}
          subtitle={`${brands.length} cadastradas`}
          icon={Building2}
        />
        <DashboardStatCard
          title="Agencies"
          value={metrics.activeAgencies}
          subtitle={`${agencies.length} parceiras`}
          icon={Handshake}
        />
        <DashboardStatCard
          title="Sponsors"
          value={metrics.activeSponsors}
          subtitle={`${sponsors.length} no pipeline`}
          icon={Target}
        />
        <DashboardStatCard
          title="Campanhas ativas"
          value={metrics.activeCampaigns}
          subtitle={brl(metrics.totalCampaignBudget) + " em orçamento"}
          icon={Megaphone}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campanhas recentes</CardTitle>
            <CardDescription>Status e orçamento das últimas movimentações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma campanha cadastrada.</p>
            ) : (
              recentCampaigns.map((c) => {
                const brand = brands.find((b) => b.id === c.brandId);
                return (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{brand?.name ?? "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline">{STATUS_LABEL[c.status] ?? c.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{brl(c.budget)}</p>
                    </div>
                  </div>
                );
              })
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/t/$tenantSlug/app/creator/campaigns" params={{ tenantSlug }}>
                Ver todas
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Communications Hub
            </CardTitle>
            <CardDescription>Inbox omnichannel conectado às campanhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Mensagens não lidas</p>
                <p className="text-xs text-muted-foreground">Inbox unificado de todos os canais</p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{commsUnread}</span>
            </div>
            <Button asChild>
              <Link to="/t/$tenantSlug/app/communications/inbox" params={{ tenantSlug }}>
                Abrir Inbox
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
