import type {
  Lead,
  Tarefa,
  EmailMsg,
  Conversa,
  Proposta,
  Usuario,
  Etapa,
  Chamado,
  Fatura,
} from "./types";
import type { PipelineItem } from "./pipelines/types";
import { PROJECTS_PIPELINE_ID } from "./pipelines/defaults";

/** Usuário inicial mínimo — necessário para responsáveis em formulários. */
export const vendedoresMock: Usuario[] = [
  {
    id: "u1",
    nome: "Administrador",
    email: "admin@vendapro.com.br",
    papel: "Administrador",
    ativo: true,
  },
];

export const etapas: Etapa[] = [
  "Sem Contato",
  "Em Atendimento",
  "Proposta Enviada",
  "Ganho",
  "Perdido",
];

export const leadsMock: Lead[] = [];
export const tarefasMock: Tarefa[] = [];
export const emailsMock: EmailMsg[] = [];
export const conversasMock: Conversa[] = [];

export const propostasMock: Proposta[] = [
  {
    id: "prop-demo-001",
    tenantId: "tenant-demo",
    clientId: "client-001",
    numero: "PROP-2026-001",
    cliente: "João Cliente",
    cnpj: "12.345.678/0001-90",
    valor: 15000,
    criadaEm: "2026-05-10T10:00:00.000Z",
    validade: "2026-06-10T10:00:00.000Z",
    status: "Pendente",
    responsavelId: "u1",
    itens: [
      { descricao: "Consultoria estratégica", qtd: 1, valorUnit: 10000 },
      { descricao: "Suporte mensal", qtd: 1, valorUnit: 5000 },
    ],
    condicoes: "Pagamento em 2x sem juros.",
    observacoes: "Proposta válida por 30 dias.",
  },
  {
    id: "prop-demo-002",
    tenantId: "tenant-demo",
    clientId: "client-001",
    numero: "PROP-2026-002",
    cliente: "João Cliente",
    cnpj: "12.345.678/0001-90",
    valor: 8500,
    criadaEm: "2026-04-15T14:00:00.000Z",
    validade: "2026-05-15T14:00:00.000Z",
    status: "Aceita",
    responsavelId: "u1",
    itens: [{ descricao: "Implementação CRM", qtd: 1, valorUnit: 8500 }],
    condicoes: "À vista com 5% de desconto.",
    observacoes: "",
  },
  {
    id: "prop-acme-001",
    tenantId: "tenant-acme",
    clientId: "client-acme-001",
    numero: "PROP-2026-101",
    cliente: "Ana Acme",
    cnpj: "98.765.432/0001-10",
    valor: 22000,
    criadaEm: "2026-05-01T09:00:00.000Z",
    validade: "2026-06-01T09:00:00.000Z",
    status: "Pendente",
    responsavelId: "u1",
    itens: [{ descricao: "Automação industrial", qtd: 1, valorUnit: 22000 }],
    condicoes: "50% na assinatura, 50% na entrega.",
    observacoes: "Inclui treinamento da equipe.",
  },
];

export const chamadosMock: Chamado[] = [
  {
    id: "cham-demo-001",
    tenantId: "tenant-demo",
    clientId: "client-001",
    titulo: "Dúvida sobre fatura",
    descricao: "Preciso de esclarecimento sobre os itens da última fatura emitida.",
    status: "Aberto",
    criadoEm: "2026-06-01T11:00:00.000Z",
    atualizadoEm: "2026-06-01T11:00:00.000Z",
  },
  {
    id: "cham-demo-002",
    tenantId: "tenant-demo",
    clientId: "client-001",
    titulo: "Solicitar treinamento",
    descricao: "Gostaria de agendar treinamento para a equipe sobre o portal.",
    status: "Resolvido",
    criadoEm: "2026-05-20T15:30:00.000Z",
    atualizadoEm: "2026-05-22T10:00:00.000Z",
  },
  {
    id: "cham-acme-001",
    tenantId: "tenant-acme",
    clientId: "client-acme-001",
    titulo: "Problema na integração",
    descricao: "A integração com o ERP parou de sincronizar pedidos.",
    status: "Em andamento",
    criadoEm: "2026-06-03T08:00:00.000Z",
    atualizadoEm: "2026-06-04T16:00:00.000Z",
  },
];

export const faturasMock: Fatura[] = [
  {
    id: "fat-demo-001",
    tenantId: "tenant-demo",
    clientId: "client-001",
    numero: "FAT-2026-001",
    descricao: "Mensalidade — Maio/2026",
    valor: 5000,
    vencimento: "2026-06-15T12:00:00.000Z",
    status: "Pendente",
    emitidaEm: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "fat-demo-002",
    tenantId: "tenant-demo",
    clientId: "client-001",
    numero: "FAT-2026-002",
    descricao: "Implementação CRM — parcela 1",
    valor: 3200,
    vencimento: "2026-05-10T12:00:00.000Z",
    status: "Paga",
    emitidaEm: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "fat-acme-001",
    tenantId: "tenant-acme",
    clientId: "client-acme-001",
    numero: "FAT-2026-101",
    descricao: "Projeto automação — entrada",
    valor: 11000,
    vencimento: "2026-06-20T12:00:00.000Z",
    status: "Pendente",
    emitidaEm: "2026-05-20T10:00:00.000Z",
  },
];

export const pipelineItemsMock: PipelineItem[] = [
  {
    id: "proj-demo-001",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "execucao",
    titulo: "Redesign do site institucional",
    dados: { cliente: "João Cliente", prazo: "2026-07-30", prioridade: "Alta" },
    responsavelId: "u1",
    clientId: "client-001",
    criadoEm: "2026-04-01T10:00:00.000Z",
    timeline: [
      { tipo: "anotacao", em: "2026-04-01T10:00:00.000Z", texto: "Projeto iniciado." },
      { tipo: "anotacao", em: "2026-05-15T14:00:00.000Z", texto: "Wireframes aprovados." },
    ],
  },
  {
    id: "proj-demo-002",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "briefing",
    titulo: "Integração com ERP",
    dados: { cliente: "João Cliente", prazo: "2026-09-15", prioridade: "Média" },
    responsavelId: "u1",
    clientId: "client-001",
    criadoEm: "2026-06-01T09:00:00.000Z",
    timeline: [],
  },
  {
    id: "proj-acme-001",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "revisao",
    titulo: "Automação linha de produção",
    dados: { cliente: "Ana Acme", prazo: "2026-08-01", prioridade: "Alta" },
    responsavelId: "u1",
    clientId: "client-acme-001",
    criadoEm: "2026-03-10T10:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-05-01T10:00:00.000Z",
        texto: "Testes em ambiente de homologação.",
      },
    ],
  },
];
