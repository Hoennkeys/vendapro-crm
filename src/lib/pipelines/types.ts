import type { TimelineItem } from "@/lib/types";

export type PipelineTipo = "vendas" | "projetos" | "onboarding" | "suporte" | "custom";

export type CardFieldType = "text" | "number" | "select" | "date" | "currency";

export type CardField = {
  key: string;
  label: string;
  type: CardFieldType;
  options?: string[];
  showOnCard?: boolean;
};

export type PipelineStage = {
  id: string;
  label: string;
  ordem: number;
  cor: string;
};

export type PipelineDefinition = {
  id: string;
  tenantId: string;
  nome: string;
  tipo: PipelineTipo;
  descricao?: string;
  stages: PipelineStage[];
  cardSchema: CardField[];
};

export type PipelineItem = {
  id: string;
  pipelineId: string;
  stageId: string;
  titulo: string;
  dados: Record<string, unknown>;
  responsavelId?: string;
  clientId?: string;
  criadoEm: string;
  timeline: TimelineItem[];
};
