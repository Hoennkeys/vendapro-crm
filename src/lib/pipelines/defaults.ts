import type { Etapa } from "@/lib/types";
import type { PipelineDefinition } from "./types";

export const SALES_PIPELINE_ID = "pipeline-vendas";
export const PROJECTS_PIPELINE_ID = "pipeline-projetos";

const ETAPA_STAGE_MAP: Record<Etapa, { id: string; cor: string }> = {
  "Sem Contato": { id: "sem-contato", cor: "bg-slate-500" },
  "Em Atendimento": { id: "em-atendimento", cor: "bg-indigo-500" },
  "Proposta Enviada": { id: "proposta-enviada", cor: "bg-amber-500" },
  Ganho: { id: "ganho", cor: "bg-emerald-600" },
  Perdido: { id: "perdido", cor: "bg-red-600" },
};

export const STAGE_ID_TO_ETAPA: Record<string, Etapa> = Object.fromEntries(
  Object.entries(ETAPA_STAGE_MAP).map(([etapa, { id }]) => [id, etapa as Etapa]),
) as Record<string, Etapa>;

export const ETAPA_TO_STAGE_ID: Record<Etapa, string> = Object.fromEntries(
  Object.entries(ETAPA_STAGE_MAP).map(([etapa, { id }]) => [etapa, id]),
) as Record<Etapa, string>;

const SALES_CARD_SCHEMA: PipelineDefinition["cardSchema"] = [
  { key: "contato", label: "Contato", type: "text", showOnCard: true },
  { key: "email", label: "E-mail", type: "text" },
  { key: "telefone", label: "Telefone", type: "text" },
  { key: "valor", label: "Valor", type: "currency", showOnCard: true },
  {
    key: "prioridade",
    label: "Prioridade",
    type: "select",
    options: ["Alta", "Média", "Baixa"],
    showOnCard: true,
  },
];

export function createDefaultSalesPipeline(tenantId: string): PipelineDefinition {
  const etapas: Etapa[] = ["Sem Contato", "Em Atendimento", "Proposta Enviada", "Ganho", "Perdido"];

  return {
    id: SALES_PIPELINE_ID,
    tenantId,
    nome: "Vendas",
    tipo: "vendas",
    descricao: "Funil comercial de oportunidades e leads.",
    stages: etapas.map((label, ordem) => ({
      id: ETAPA_STAGE_MAP[label].id,
      label,
      ordem,
      cor: ETAPA_STAGE_MAP[label].cor,
    })),
    cardSchema: SALES_CARD_SCHEMA,
  };
}

export function createProjectsPipeline(tenantId: string): PipelineDefinition {
  return {
    id: PROJECTS_PIPELINE_ID,
    tenantId,
    nome: "Projetos",
    tipo: "projetos",
    descricao: "Acompanhamento de entregas, marcos e status de projetos.",
    stages: [
      { id: "briefing", label: "Briefing", ordem: 0, cor: "bg-slate-500" },
      { id: "execucao", label: "Em execução", ordem: 1, cor: "bg-indigo-500" },
      { id: "revisao", label: "Revisão", ordem: 2, cor: "bg-amber-500" },
      { id: "entregue", label: "Entregue", ordem: 3, cor: "bg-emerald-600" },
    ],
    cardSchema: [
      { key: "cliente", label: "Marca", type: "text", showOnCard: true },
      { key: "prazo", label: "Prazo", type: "date", showOnCard: true },
      {
        key: "prioridade",
        label: "Prioridade",
        type: "select",
        options: ["Alta", "Média", "Baixa"],
        showOnCard: true,
      },
    ],
  };
}

export function getPipelinesForTenant(tenantId: string): PipelineDefinition[] {
  return [createDefaultSalesPipeline(tenantId), createProjectsPipeline(tenantId)];
}

export function getPipelineById(
  tenantId: string,
  pipelineId: string,
): PipelineDefinition | undefined {
  return getPipelinesForTenant(tenantId).find((p) => p.id === pipelineId);
}
