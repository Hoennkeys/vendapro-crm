import { PROJECTS_PIPELINE_ID } from "@/lib/pipelines/defaults";
import type { PipelineItem } from "@/lib/pipelines/types";
import type { Chamado, Fatura, Proposta } from "@/lib/types";

type ClientScope = {
  tenantId: string;
  clientId: string;
};

function matchesClient<T extends { tenantId: string; clientId: string }>(
  item: T,
  scope: ClientScope,
): boolean {
  return item.tenantId === scope.tenantId && item.clientId === scope.clientId;
}

export function filterPropostasForClient(propostas: Proposta[], scope: ClientScope) {
  return propostas.filter((p) => matchesClient(p, scope));
}

export function filterChamadosForClient(chamados: Chamado[], scope: ClientScope) {
  return chamados
    .filter((c) => matchesClient(c, scope))
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
}

export function filterFaturasForClient(faturas: Fatura[], scope: ClientScope) {
  return faturas
    .filter((f) => matchesClient(f, scope))
    .sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime());
}

export function filterProjetosForClient(items: PipelineItem[], scope: ClientScope) {
  return items
    .filter((item) => item.pipelineId === PROJECTS_PIPELINE_ID && item.clientId === scope.clientId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
}
