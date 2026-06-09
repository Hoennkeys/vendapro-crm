import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { filterProjetosForClient } from "@/lib/client-portal/selectors";
import { useClientScope } from "@/lib/client-portal/use-client-scope";
import { useCrm } from "@/lib/crm-store";
import { getPipelineById, PROJECTS_PIPELINE_ID } from "@/lib/pipelines/defaults";
import { brDate } from "@/lib/format";

export const Route = createFileRoute("/t/$tenantSlug/portal/projetos")({
  head: () => ({ meta: [{ title: "Projetos — Portal do Cliente" }] }),
  component: PortalProjetos,
});

const STAGE_PROGRESS: Record<string, number> = {
  briefing: 15,
  execucao: 50,
  revisao: 80,
  entregue: 100,
};

function PortalProjetos() {
  const scope = useClientScope();
  const { pipelineItems } = useCrm();
  const projetos = filterProjetosForClient(pipelineItems, scope);
  const pipeline = getPipelineById(scope.tenantId, PROJECTS_PIPELINE_ID);

  const stageLabel = (stageId: string) =>
    pipeline?.stages.find((s) => s.id === stageId)?.label ?? stageId;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seus Projetos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o status e andamento dos projetos em execução.
        </p>
      </div>

      {projetos.length === 0 ? (
        <PortalEmptyState
          icon={FolderKanban}
          title="Nenhum projeto em andamento"
          description="Seus projetos ativos aparecerão aqui com status e prazos."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projetos.map((proj) => {
            const label = stageLabel(proj.stageId);
            const progress = STAGE_PROGRESS[proj.stageId] ?? 0;
            const prazo = proj.dados.prazo as string | undefined;

            return (
              <Card key={proj.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{proj.titulo}</CardTitle>
                    <PortalStatusBadge status={label} />
                  </div>
                  {prazo && <CardDescription>Prazo: {brDate(prazo)}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  {proj.timeline.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Última atualização: {proj.timeline[proj.timeline.length - 1].texto}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
