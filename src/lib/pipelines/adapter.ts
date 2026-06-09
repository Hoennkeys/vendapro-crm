import type { Lead, Prioridade } from "@/lib/types";
import { ETAPA_TO_STAGE_ID, SALES_PIPELINE_ID, STAGE_ID_TO_ETAPA } from "./defaults";
import type { PipelineItem } from "./types";

export function leadToPipelineItem(lead: Lead, pipelineId = SALES_PIPELINE_ID): PipelineItem {
  const stageId = ETAPA_TO_STAGE_ID[lead.etapa] ?? ETAPA_TO_STAGE_ID["Sem Contato"];
  return {
    id: lead.id,
    pipelineId,
    stageId,
    titulo: lead.cliente,
    dados: {
      contato: lead.contato,
      email: lead.email,
      telefone: lead.telefone,
      valor: lead.valor,
      prioridade: lead.prioridade,
    },
    responsavelId: lead.responsavelId,
    criadoEm: lead.criadoEm,
    timeline: lead.timeline,
  };
}

export function leadsToPipelineItems(
  leads: Lead[],
  pipelineId = SALES_PIPELINE_ID,
): PipelineItem[] {
  return leads.map((lead) => leadToPipelineItem(lead, pipelineId));
}

export function stageIdToEtapa(stageId: string): Lead["etapa"] | undefined {
  return STAGE_ID_TO_ETAPA[stageId];
}

export type NovoLeadForm = {
  cliente: string;
  contato: string;
  email: string;
  telefone: string;
  valor: number;
  etapa: Lead["etapa"];
  prioridade: Prioridade;
  responsavelId: string;
};

export function novoLeadFormFromItem(
  item: Omit<PipelineItem, "id" | "criadoEm" | "timeline">,
): NovoLeadForm {
  const etapa = stageIdToEtapa(item.stageId) ?? "Sem Contato";
  return {
    cliente: item.titulo,
    contato: String(item.dados.contato ?? ""),
    email: String(item.dados.email ?? ""),
    telefone: String(item.dados.telefone ?? ""),
    valor: Number(item.dados.valor ?? 0),
    etapa,
    prioridade: (item.dados.prioridade as Prioridade) ?? "Média",
    responsavelId: item.responsavelId ?? "",
  };
}
