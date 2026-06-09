import type { PipelineItem } from "@/lib/pipelines/types";
import type {
  Chamado,
  Conversa,
  EmailMsg,
  Fatura,
  Lead,
  Proposta,
  Tarefa,
  Usuario,
} from "@/lib/types";

/** Snapshot CRM persistido por tenant no banco. */
export type TenantCrmSnapshot = {
  leads: Lead[];
  tarefas: Tarefa[];
  emails: EmailMsg[];
  conversas: Conversa[];
  propostas: Proposta[];
  chamados: Chamado[];
  faturas: Fatura[];
  pipelineItems: PipelineItem[];
  usuarios: Usuario[];
};

export const EMPTY_CRM_SNAPSHOT: TenantCrmSnapshot = {
  leads: [],
  tarefas: [],
  emails: [],
  conversas: [],
  propostas: [],
  chamados: [],
  faturas: [],
  pipelineItems: [],
  usuarios: [],
};
