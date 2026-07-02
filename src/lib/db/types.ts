import type { PipelineItem } from "@/lib/pipelines/types";
import type { CommunicationsSnapshot } from "@/modules/communications/domain/entities";
import type { CreatorSnapshot } from "@/modules/creator/domain/entities";
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
export type CrmConfiguracoes = {
  metaMensal: number;
  empresaNome: string;
  timezone: string;
  moeda: string;
  smtpHost: string;
  smtpPorta: number;
  smtpUsuario: string;
  whatsappConectado: boolean;
  whatsappNumero: string;
};

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
  configuracoes?: CrmConfiguracoes;
  communications?: CommunicationsSnapshot;
  creator?: CreatorSnapshot;
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
