import { createFileRoute, Link } from "@tanstack/react-router";
import { KanbanSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPipelinesForTenant } from "@/lib/pipelines/defaults";
import { useTenant } from "@/lib/tenant/tenant-store";
import { useCrm } from "@/lib/crm-store";
import { leadsToPipelineItems } from "@/lib/pipelines/adapter";
import { SALES_PIPELINE_ID, PROJECTS_PIPELINE_ID } from "@/lib/pipelines/defaults";
import { pageTitle } from "@/lib/product-branding";
import {
  labelPipelineDescription,
  labelPipelineDisplay,
  NAV_LABELS,
} from "@/modules/creator/domain/terminology";

export const Route = createFileRoute("/t/$tenantSlug/app/funil/")({
  head: () => ({ meta: [{ title: pageTitle(NAV_LABELS.campaignPipeline) }] }),
  component: FunilIndex,
});

function FunilIndex() {
  const { tenantSlug } = Route.useParams();
  const { whiteLabel } = useTenant();
  const { leads, pipelineItems } = useCrm();
  const pipelines = getPipelinesForTenant(whiteLabel.tenantId);
  const salesItems = leadsToPipelineItems(leads);
  const projectItems = pipelineItems.filter((i) => i.pipelineId === PROJECTS_PIPELINE_ID);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{NAV_LABELS.campaignPipeline}</h1>
        <p className="text-sm text-muted-foreground">
          Selecione um pipeline para visualizar o quadro kanban.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pipelines.map((pipeline) => {
          const isSales = pipeline.id === SALES_PIPELINE_ID;
          const itemCount = isSales ? salesItems.length : projectItems.length;
          const emBreve = false;

          return (
            <Card key={pipeline.id} className={emBreve ? "opacity-75" : undefined}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <KanbanSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {labelPipelineDisplay(pipeline.id, pipeline.nome)}
                      </CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {pipeline.tipo}
                      </CardDescription>
                    </div>
                  </div>
                {emBreve ? (
                  <Badge variant="secondary">Em breve</Badge>
                ) : (
                  <Badge variant="secondary">{itemCount} itens</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {labelPipelineDescription(pipeline.id, pipeline.descricao)}
              </p>
              <p className="text-xs text-muted-foreground">{pipeline.stages.length} etapas</p>
              {!emBreve ? (
                <Button asChild size="sm">
                  <Link
                    to="/t/$tenantSlug/app/funil/$pipelineId"
                    params={{ tenantSlug, pipelineId: pipeline.id }}
                  >
                    Abrir kanban
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="sm" disabled variant="outline">
                  Indisponível
                </Button>
              )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
