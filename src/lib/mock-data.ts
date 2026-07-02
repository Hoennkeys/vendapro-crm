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
import type { TenantCrmSnapshot, CrmConfiguracoes } from "./db/types";
import { buildMockCreatorForTenant } from "@/modules/creator/data/mock-creator-data";
import { PROJECTS_PIPELINE_ID } from "./pipelines/defaults";

export const DEMO_TENANT_ID = "tenant-demo";
export const ACME_TENANT_ID = "tenant-acme";

export const DEMO_CLIENT_ID = "client-001";
export const ACME_CLIENT_ID = "client-acme-001";

/** IDs alinhados com mock-users.ts */
export const USER_MARIA = "user-operacional";
export const USER_CARLOS = "user-operacional-acme";
export const USER_RICARDO_DEMO = "user-vendedor-demo-2";
export const USER_FERNANDA_ACME = "user-vendedor-acme-2";

export const etapas: Etapa[] = [
  "Sem Contato",
  "Em Atendimento",
  "Proposta Enviada",
  "Ganho",
  "Perdido",
];

// ─── Usuários CRM por tenant ─────────────────────────────────────────────────

const usuariosDemo: Usuario[] = [
  {
    id: USER_MARIA,
    nome: "Maria Operacional",
    email: "operacional@demo.com",
    papel: "Vendedor",
    ativo: true,
  },
  {
    id: USER_RICARDO_DEMO,
    nome: "Ricardo Mendes",
    email: "ricardo@demo.com",
    papel: "Vendedor",
    ativo: true,
  },
];

const usuariosAcme: Usuario[] = [
  {
    id: USER_CARLOS,
    nome: "Carlos Acme",
    email: "operacional@acme.com",
    papel: "Administrador",
    ativo: true,
  },
  {
    id: USER_FERNANDA_ACME,
    nome: "Fernanda Lima",
    email: "fernanda@acme.com",
    papel: "Vendedor",
    ativo: true,
  },
];

/** @deprecated Use buildMockSnapshotForTenant — mantido para imports legados */
export const vendedoresMock: Usuario[] = usuariosDemo;

// ─── Leads ───────────────────────────────────────────────────────────────────

const leadsDemo: Lead[] = [
  {
    id: "lead-demo-jc-ganho",
    cliente: "João Cliente ME",
    contato: "João Cliente",
    email: "cliente@demo.com",
    telefone: "(11) 98765-4321",
    valor: 8500,
    etapa: "Ganho",
    prioridade: "Alta",
    responsavelId: USER_MARIA,
    criadoEm: "2026-03-01T09:00:00.000Z",
    clientId: DEMO_CLIENT_ID,
    timeline: [
      {
        tipo: "ligacao",
        em: "2026-03-05T14:00:00.000Z",
        texto: "Primeira call — mapeamento de necessidades de CRM.",
      },
      {
        tipo: "email",
        em: "2026-04-10T10:00:00.000Z",
        texto: "Proposta PROP-2026-002 enviada (Implementação CRM).",
      },
      {
        tipo: "anotacao",
        em: "2026-04-20T16:30:00.000Z",
        texto: "Proposta aceita. Projeto Redesign iniciado.",
      },
    ],
  },
  {
    id: "lead-demo-jc-ativo",
    cliente: "João Cliente ME",
    contato: "João Cliente",
    email: "cliente@demo.com",
    telefone: "(11) 98765-4321",
    valor: 15000,
    etapa: "Proposta Enviada",
    prioridade: "Alta",
    responsavelId: USER_MARIA,
    criadoEm: "2026-05-01T11:00:00.000Z",
    clientId: DEMO_CLIENT_ID,
    timeline: [
      {
        tipo: "email",
        em: "2026-05-10T10:00:00.000Z",
        texto: "Proposta PROP-2026-001 enviada (Consultoria estratégica).",
      },
      {
        tipo: "mensagem",
        em: "2026-06-01T11:30:00.000Z",
        texto: "Cliente questionou itens da fatura FAT-2026-001 via WhatsApp.",
      },
    ],
  },
  {
    id: "lead-demo-metal",
    cliente: "Metalúrgica Horizonte",
    contato: "Patricia Souza",
    email: "patricia@metalhorizonte.com.br",
    telefone: "(31) 99876-5432",
    valor: 32000,
    etapa: "Em Atendimento",
    prioridade: "Alta",
    responsavelId: USER_MARIA,
    criadoEm: "2026-05-20T08:00:00.000Z",
    timeline: [
      {
        tipo: "ligacao",
        em: "2026-05-22T10:00:00.000Z",
        texto: "Demo do funil comercial — interesse em plano Pro.",
      },
    ],
  },
  {
    id: "lead-demo-technova",
    cliente: "TechNova Soluções",
    contato: "Lucas Ferreira",
    email: "lucas@technova.com.br",
    telefone: "(21) 97654-3210",
    valor: 24000,
    etapa: "Proposta Enviada",
    prioridade: "Média",
    responsavelId: USER_RICARDO_DEMO,
    criadoEm: "2026-05-08T14:00:00.000Z",
    timeline: [
      {
        tipo: "email",
        em: "2026-05-28T09:00:00.000Z",
        texto: "Proposta comercial enviada — aguardando retorno do Lucas.",
      },
    ],
  },
  {
    id: "lead-demo-agro",
    cliente: "AgroVerde Ltda",
    contato: "Marcos Oliveira",
    email: "marcos@agroverde.com.br",
    telefone: "(62) 99123-4567",
    valor: 18000,
    etapa: "Sem Contato",
    prioridade: "Média",
    responsavelId: USER_RICARDO_DEMO,
    criadoEm: "2026-06-10T07:00:00.000Z",
    timeline: [],
  },
  {
    id: "lead-demo-log",
    cliente: "Logística Prime",
    contato: "Camila Rocha",
    email: "camila@logisticaprime.com.br",
    telefone: "(41) 98888-7777",
    valor: 9500,
    etapa: "Sem Contato",
    prioridade: "Baixa",
    responsavelId: USER_MARIA,
    criadoEm: "2026-06-12T10:00:00.000Z",
    timeline: [],
  },
  {
    id: "lead-demo-edu",
    cliente: "EduTech Cursos",
    contato: "Renata Dias",
    email: "renata@edutech.cursos",
    telefone: "(11) 91234-5678",
    valor: 12000,
    etapa: "Ganho",
    prioridade: "Média",
    responsavelId: USER_RICARDO_DEMO,
    criadoEm: "2026-04-01T09:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-05-15T17:00:00.000Z",
        texto: "Contrato assinado — onboarding concluído.",
      },
    ],
  },
  {
    id: "lead-demo-dist",
    cliente: "Distribuidora Sul",
    contato: "Felipe Nunes",
    email: "felipe@distsul.com.br",
    telefone: "(51) 99999-1111",
    valor: 9000,
    etapa: "Perdido",
    prioridade: "Baixa",
    responsavelId: USER_MARIA,
    criadoEm: "2026-02-10T11:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-04-01T09:00:00.000Z",
        texto: "Perdido para concorrente — preço.",
      },
    ],
  },
  {
    id: "lead-demo-constr",
    cliente: "Construtora Atlas",
    contato: "Bruno Carvalho",
    email: "bruno@construtorasatlas.com.br",
    telefone: "(11) 95555-4444",
    valor: 45000,
    etapa: "Em Atendimento",
    prioridade: "Alta",
    responsavelId: USER_RICARDO_DEMO,
    criadoEm: "2026-06-05T13:00:00.000Z",
    timeline: [
      {
        tipo: "ligacao",
        em: "2026-06-08T15:00:00.000Z",
        texto: "Reunião com diretoria — escopo ampliado para 3 filiais.",
      },
    ],
  },
];

const leadsAcme: Lead[] = [
  {
    id: "lead-acme-ana-ativo",
    cliente: "Acme Indústria",
    contato: "Ana Acme",
    email: "cliente@acme.com",
    telefone: "(19) 98765-1234",
    valor: 22000,
    etapa: "Proposta Enviada",
    prioridade: "Alta",
    responsavelId: USER_CARLOS,
    criadoEm: "2026-04-15T10:00:00.000Z",
    clientId: ACME_CLIENT_ID,
    timeline: [
      {
        tipo: "email",
        em: "2026-05-01T09:00:00.000Z",
        texto: "Proposta PROP-2026-101 enviada (Automação industrial).",
      },
      {
        tipo: "anotacao",
        em: "2026-06-03T08:00:00.000Z",
        texto: "Chamado aberto — integração ERP com falha de sincronização.",
      },
    ],
  },
  {
    id: "lead-acme-beta",
    cliente: "Indústrias Beta",
    contato: "Roberto Silva",
    email: "roberto@industriasbeta.com.br",
    telefone: "(11) 93333-2222",
    valor: 38000,
    etapa: "Em Atendimento",
    prioridade: "Alta",
    responsavelId: USER_FERNANDA_ACME,
    criadoEm: "2026-05-25T09:00:00.000Z",
    timeline: [
      {
        tipo: "ligacao",
        em: "2026-06-01T11:00:00.000Z",
        texto: "Visita técnica agendada para levantamento de linha.",
      },
    ],
  },
  {
    id: "lead-acme-gamma",
    cliente: "Gamma Plásticos",
    contato: "Helena Costa",
    email: "helena@gammaplasticos.com.br",
    telefone: "(47) 98888-3333",
    valor: 16500,
    etapa: "Sem Contato",
    prioridade: "Média",
    responsavelId: USER_FERNANDA_ACME,
    criadoEm: "2026-06-08T08:00:00.000Z",
    timeline: [],
  },
  {
    id: "lead-acme-delta",
    cliente: "Delta Química",
    contato: "Paulo Mendes",
    email: "paulo@deltaquimica.com.br",
    telefone: "(13) 97777-6666",
    valor: 52000,
    etapa: "Proposta Enviada",
    prioridade: "Alta",
    responsavelId: USER_CARLOS,
    criadoEm: "2026-05-10T14:00:00.000Z",
    timeline: [
      {
        tipo: "email",
        em: "2026-05-30T10:00:00.000Z",
        texto: "Proposta de automação de estoque enviada.",
      },
    ],
  },
  {
    id: "lead-acme-epsilon",
    cliente: "Epsilon Máquinas",
    contato: "Juliana Prado",
    email: "juliana@epsilonmaquinas.com.br",
    telefone: "(48) 96666-5555",
    valor: 28000,
    etapa: "Ganho",
    prioridade: "Média",
    responsavelId: USER_FERNANDA_ACME,
    criadoEm: "2026-03-20T10:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-05-20T16:00:00.000Z",
        texto: "Projeto entregue — cliente satisfeito, indicação recebida.",
      },
    ],
  },
  {
    id: "lead-acme-zeta",
    cliente: "Zeta Componentes",
    contato: "Diego Alves",
    email: "diego@zetacomponentes.com.br",
    telefone: "(54) 95555-8888",
    valor: 11000,
    etapa: "Perdido",
    prioridade: "Baixa",
    responsavelId: USER_CARLOS,
    criadoEm: "2026-01-15T09:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-03-01T10:00:00.000Z",
        texto: "Projeto adiado pelo cliente — recontato em Q3.",
      },
    ],
  },
  {
    id: "lead-acme-eta",
    cliente: "Eta Embalagens",
    contato: "Sandra Lima",
    email: "sandra@etaembalagens.com.br",
    telefone: "(11) 94444-7777",
    valor: 19500,
    etapa: "Em Atendimento",
    prioridade: "Média",
    responsavelId: USER_FERNANDA_ACME,
    criadoEm: "2026-06-02T11:00:00.000Z",
    timeline: [],
  },
];

// ─── Tarefas ─────────────────────────────────────────────────────────────────

const tarefasDemo: Tarefa[] = [
  {
    id: "tarefa-demo-001",
    titulo: "Revisar proposta de consultoria com João",
    responsavelId: USER_MARIA,
    prazo: "2026-06-18T17:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-demo-jc-ativo",
  },
  {
    id: "tarefa-demo-002",
    titulo: "Ligar para Patricia — Metalúrgica Horizonte",
    responsavelId: USER_MARIA,
    prazo: "2026-06-17T12:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-demo-metal",
  },
  {
    id: "tarefa-demo-003",
    titulo: "Follow-up proposta TechNova",
    responsavelId: USER_RICARDO_DEMO,
    prazo: "2026-06-19T10:00:00.000Z",
    prioridade: "Média",
    concluida: false,
    leadId: "lead-demo-technova",
  },
  {
    id: "tarefa-demo-004",
    titulo: "Agendar demo AgroVerde",
    responsavelId: USER_RICARDO_DEMO,
    prazo: "2026-06-14T09:00:00.000Z",
    prioridade: "Média",
    concluida: true,
    leadId: "lead-demo-agro",
  },
  {
    id: "tarefa-demo-005",
    titulo: "Concluir onboarding João Cliente",
    responsavelId: USER_MARIA,
    prazo: "2026-06-20T18:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-demo-jc-ganho",
  },
  {
    id: "tarefa-demo-006",
    titulo: "Preparar proposta Construtora Atlas",
    responsavelId: USER_RICARDO_DEMO,
    prazo: "2026-06-22T17:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-demo-constr",
  },
];

const tarefasAcme: Tarefa[] = [
  {
    id: "tarefa-acme-001",
    titulo: "Resolver integração ERP — Ana Acme",
    responsavelId: USER_CARLOS,
    prazo: "2026-06-17T18:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-acme-ana-ativo",
  },
  {
    id: "tarefa-acme-002",
    titulo: "Visita técnica Indústrias Beta",
    responsavelId: USER_FERNANDA_ACME,
    prazo: "2026-06-20T09:00:00.000Z",
    prioridade: "Alta",
    concluida: false,
    leadId: "lead-acme-beta",
  },
  {
    id: "tarefa-acme-003",
    titulo: "Follow-up proposta Delta Química",
    responsavelId: USER_CARLOS,
    prazo: "2026-06-19T14:00:00.000Z",
    prioridade: "Média",
    concluida: false,
    leadId: "lead-acme-delta",
  },
  {
    id: "tarefa-acme-004",
    titulo: "Primeiro contato Gamma Plásticos",
    responsavelId: USER_FERNANDA_ACME,
    prazo: "2026-06-18T11:00:00.000Z",
    prioridade: "Média",
    concluida: false,
    leadId: "lead-acme-gamma",
  },
];

// ─── E-mails ─────────────────────────────────────────────────────────────────

const emailsDemo: EmailMsg[] = [
  {
    id: "email-demo-001",
    de: "lucas@technova.com.br",
    para: "operacional@demo.com",
    assunto: "Re: Proposta comercial TechNova",
    corpo: "Olá Maria, recebemos a proposta. Podemos agendar uma call na quinta para alinhar condições?",
    em: "2026-06-14T09:30:00.000Z",
    pasta: "Caixa de Entrada",
    lida: false,
  },
  {
    id: "email-demo-002",
    de: "operacional@demo.com",
    para: "patricia@metalhorizonte.com.br",
    assunto: "Demo VendaPro — Metalúrgica Horizonte",
    corpo: "Patricia, conforme combinado segue o link para nossa demo de quinta-feira às 10h.",
    em: "2026-06-13T16:00:00.000Z",
    pasta: "Enviados",
    lida: true,
  },
  {
    id: "email-demo-003",
    de: "cliente@demo.com",
    para: "operacional@demo.com",
    assunto: "Dúvida sobre fatura FAT-2026-001",
    corpo: "Maria, boa tarde. Poderia detalhar os itens da mensalidade de maio? Abri um chamado no portal também.",
    em: "2026-06-01T11:05:00.000Z",
    pasta: "Caixa de Entrada",
    lida: true,
  },
  {
    id: "email-demo-004",
    de: "operacional@demo.com",
    para: "cliente@demo.com",
    assunto: "Proposta PROP-2026-001 — Consultoria estratégica",
    corpo: "João, segue em anexo a proposta de consultoria. Validade até 10/06. Fico à disposição.",
    em: "2026-05-10T10:15:00.000Z",
    pasta: "Enviados",
    lida: true,
  },
  {
    id: "email-demo-005",
    de: "bruno@construtorasatlas.com.br",
    para: "ricardo@demo.com",
    assunto: "Escopo ampliado — 3 filiais",
    corpo: "Ricardo, após a reunião precisamos incluir as filiais SP, RJ e BH no escopo. Aguardo nova proposta.",
    em: "2026-06-09T08:45:00.000Z",
    pasta: "Caixa de Entrada",
    lida: false,
  },
];

const emailsAcme: EmailMsg[] = [
  {
    id: "email-acme-001",
    de: "cliente@acme.com",
    para: "operacional@acme.com",
    assunto: "Integração ERP parou de sincronizar",
    corpo: "Carlos, desde ontem os pedidos não estão sincronizando. Já abri chamado no portal. Urgente.",
    em: "2026-06-03T08:10:00.000Z",
    pasta: "Caixa de Entrada",
    lida: true,
  },
  {
    id: "email-acme-002",
    de: "operacional@acme.com",
    para: "cliente@acme.com",
    assunto: "Re: Proposta PROP-2026-101 — Automação industrial",
    corpo: "Ana, proposta enviada. Entrada de 50% conforme FAT-2026-101. Projeto em revisão na linha de produção.",
    em: "2026-05-20T11:00:00.000Z",
    pasta: "Enviados",
    lida: true,
  },
  {
    id: "email-acme-003",
    de: "roberto@industriasbeta.com.br",
    para: "fernanda@acme.com",
    assunto: "Confirmação visita técnica",
    corpo: "Fernanda, confirmada a visita para dia 20/06 às 9h na planta de Campinas.",
    em: "2026-06-12T14:20:00.000Z",
    pasta: "Caixa de Entrada",
    lida: false,
  },
  {
    id: "email-acme-004",
    de: "operacional@acme.com",
    para: "paulo@deltaquimica.com.br",
    assunto: "Proposta automação de estoque",
    corpo: "Paulo, segue proposta conforme levantamento. Prazo de validade: 30 dias.",
    em: "2026-05-30T10:30:00.000Z",
    pasta: "Enviados",
    lida: true,
  },
];

// ─── Conversas (WhatsApp) ────────────────────────────────────────────────────

const conversasDemo: Conversa[] = [
  {
    id: "conv-demo-001",
    contatoNome: "João Cliente",
    contatoEmpresa: "João Cliente ME",
    telefone: "(11) 98765-4321",
    leadId: "lead-demo-jc-ativo",
    agenteId: USER_MARIA,
    naoLidas: 1,
    mensagens: [
      {
        id: "msg-demo-001a",
        autor: "cliente",
        texto: "Maria, recebi a fatura de maio. Pode explicar os itens?",
        em: "2026-06-01T11:00:00.000Z",
        lida: true,
      },
      {
        id: "msg-demo-001b",
        autor: "agente",
        texto: "Claro João! A mensalidade inclui suporte e hospedagem. Vou detalhar por e-mail.",
        em: "2026-06-01T11:15:00.000Z",
        lida: true,
      },
      {
        id: "msg-demo-001c",
        autor: "cliente",
        texto: "Perfeito. E a proposta de consultoria ainda está válida?",
        em: "2026-06-14T15:30:00.000Z",
        lida: false,
      },
    ],
  },
  {
    id: "conv-demo-002",
    contatoNome: "Patricia Souza",
    contatoEmpresa: "Metalúrgica Horizonte",
    telefone: "(31) 99876-5432",
    leadId: "lead-demo-metal",
    agenteId: USER_MARIA,
    naoLidas: 0,
    mensagens: [
      {
        id: "msg-demo-002a",
        autor: "agente",
        texto: "Patricia, confirmada a demo de quinta às 10h!",
        em: "2026-06-13T16:30:00.000Z",
        lida: true,
      },
      {
        id: "msg-demo-002b",
        autor: "cliente",
        texto: "Confirmado! Vou levar o gerente comercial também.",
        em: "2026-06-13T17:00:00.000Z",
        lida: true,
      },
    ],
  },
  {
    id: "conv-demo-003",
    contatoNome: "Lucas Ferreira",
    contatoEmpresa: "TechNova Soluções",
    telefone: "(21) 97654-3210",
    leadId: "lead-demo-technova",
    agenteId: USER_RICARDO_DEMO,
    naoLidas: 0,
    mensagens: [
      {
        id: "msg-demo-003a",
        autor: "cliente",
        texto: "Ricardo, podemos fechar na quinta?",
        em: "2026-06-14T09:45:00.000Z",
        lida: true,
      },
    ],
  },
];

const conversasAcme: Conversa[] = [
  {
    id: "conv-acme-001",
    contatoNome: "Ana Acme",
    contatoEmpresa: "Acme Indústria",
    telefone: "(19) 98765-1234",
    leadId: "lead-acme-ana-ativo",
    agenteId: USER_CARLOS,
    naoLidas: 0,
    mensagens: [
      {
        id: "msg-acme-001a",
        autor: "cliente",
        texto: "Carlos, a integração ERP parou. Preciso de urgência.",
        em: "2026-06-03T08:05:00.000Z",
        lida: true,
      },
      {
        id: "msg-acme-001b",
        autor: "agente",
        texto: "Recebido Ana. Já estou analisando — abri chamado e te atualizo em 2h.",
        em: "2026-06-03T08:20:00.000Z",
        lida: true,
      },
      {
        id: "msg-acme-001c",
        autor: "agente",
        texto: "Correção aplicada em homologação. Validamos amanhã cedo?",
        em: "2026-06-04T16:30:00.000Z",
        lida: true,
      },
    ],
  },
  {
    id: "conv-acme-002",
    contatoNome: "Roberto Silva",
    contatoEmpresa: "Indústrias Beta",
    telefone: "(11) 93333-2222",
    leadId: "lead-acme-beta",
    agenteId: USER_FERNANDA_ACME,
    naoLidas: 1,
    mensagens: [
      {
        id: "msg-acme-002a",
        autor: "cliente",
        texto: "Fernanda, confirmada visita dia 20. Preciso da lista de equipamentos.",
        em: "2026-06-12T14:30:00.000Z",
        lida: false,
      },
    ],
  },
];

// ─── Propostas (portal cliente) ──────────────────────────────────────────────

export const propostasMock: Proposta[] = [
  {
    id: "prop-demo-001",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    numero: "PROP-2026-001",
    cliente: "João Cliente",
    cnpj: "12.345.678/0001-90",
    valor: 15000,
    criadaEm: "2026-05-10T10:00:00.000Z",
    validade: "2026-06-10T10:00:00.000Z",
    status: "Pendente",
    responsavelId: USER_MARIA,
    itens: [
      { descricao: "Consultoria estratégica", qtd: 1, valorUnit: 10000 },
      { descricao: "Suporte mensal", qtd: 1, valorUnit: 5000 },
    ],
    condicoes: "Pagamento em 2x sem juros.",
    observacoes: "Vinculada ao lead lead-demo-jc-ativo. Fatura mensal FAT-2026-001.",
    leadId: "lead-demo-jc-ativo",
  },
  {
    id: "prop-demo-002",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    numero: "PROP-2026-002",
    cliente: "João Cliente",
    cnpj: "12.345.678/0001-90",
    valor: 8500,
    criadaEm: "2026-04-15T14:00:00.000Z",
    validade: "2026-05-15T14:00:00.000Z",
    status: "Aceita",
    responsavelId: USER_MARIA,
    itens: [{ descricao: "Implementação CRM", qtd: 1, valorUnit: 8500 }],
    condicoes: "À vista com 5% de desconto.",
    observacoes: "Projeto proj-demo-001 (Redesign). Fatura FAT-2026-002.",
    leadId: "lead-demo-jc-ganho",
  },
  {
    id: "prop-demo-003",
    tenantId: DEMO_TENANT_ID,
    clientId: "",
    numero: "PROP-2026-003",
    cliente: "TechNova Soluções",
    cnpj: "45.678.901/0001-22",
    valor: 24000,
    criadaEm: "2026-05-28T09:00:00.000Z",
    validade: "2026-06-28T09:00:00.000Z",
    status: "Pendente",
    responsavelId: USER_RICARDO_DEMO,
    itens: [
      { descricao: "Licenças CRM (20 usuários)", qtd: 1, valorUnit: 18000 },
      { descricao: "Onboarding e treinamento", qtd: 1, valorUnit: 6000 },
    ],
    condicoes: "Pagamento em 3x.",
    observacoes: "Lead lead-demo-technova. Follow-up via e-mail e WhatsApp.",
    leadId: "lead-demo-technova",
  },
  {
    id: "prop-acme-001",
    tenantId: ACME_TENANT_ID,
    clientId: ACME_CLIENT_ID,
    numero: "PROP-2026-101",
    cliente: "Ana Acme",
    cnpj: "98.765.432/0001-10",
    valor: 22000,
    criadaEm: "2026-05-01T09:00:00.000Z",
    validade: "2026-06-01T09:00:00.000Z",
    status: "Pendente",
    responsavelId: USER_CARLOS,
    itens: [{ descricao: "Automação industrial", qtd: 1, valorUnit: 22000 }],
    condicoes: "50% na assinatura, 50% na entrega.",
    observacoes: "Entrada FAT-2026-101. Projeto proj-acme-001. Chamado cham-acme-001.",
    leadId: "lead-acme-ana-ativo",
  },
  {
    id: "prop-acme-002",
    tenantId: ACME_TENANT_ID,
    clientId: "",
    numero: "PROP-2026-102",
    cliente: "Delta Química",
    cnpj: "11.222.333/0001-44",
    valor: 52000,
    criadaEm: "2026-05-30T10:00:00.000Z",
    validade: "2026-06-30T10:00:00.000Z",
    status: "Pendente",
    responsavelId: USER_CARLOS,
    itens: [{ descricao: "Automação de estoque e expedição", qtd: 1, valorUnit: 52000 }],
    condicoes: "40% entrada, 60% na entrega.",
    observacoes: "Lead lead-acme-delta. Contato: paulo@deltaquimica.com.br",
    leadId: "lead-acme-delta",
  },
];

// ─── Chamados ──────────────────────────────────────────────────────────────────

export const chamadosMock: Chamado[] = [
  {
    id: "cham-demo-001",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    titulo: "Dúvida sobre fatura",
    descricao:
      "Preciso de esclarecimento sobre os itens da fatura FAT-2026-001 (mensalidade maio). Relacionado ao e-mail de 01/06.",
    status: "Aberto",
    criadoEm: "2026-06-01T11:00:00.000Z",
    atualizadoEm: "2026-06-01T11:00:00.000Z",
  },
  {
    id: "cham-demo-002",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    titulo: "Solicitar treinamento",
    descricao: "Gostaria de agendar treinamento para a equipe sobre o portal e funil de vendas.",
    status: "Resolvido",
    criadoEm: "2026-05-20T15:30:00.000Z",
    atualizadoEm: "2026-05-22T10:00:00.000Z",
  },
  {
    id: "cham-acme-001",
    tenantId: ACME_TENANT_ID,
    clientId: ACME_CLIENT_ID,
    titulo: "Problema na integração ERP",
    descricao:
      "A integração com o ERP parou de sincronizar pedidos desde 02/06. Impacta linha de produção.",
    status: "Em andamento",
    criadoEm: "2026-06-03T08:00:00.000Z",
    atualizadoEm: "2026-06-04T16:00:00.000Z",
  },
];

// ─── Faturas ───────────────────────────────────────────────────────────────────

export const faturasMock: Fatura[] = [
  {
    id: "fat-demo-001",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    numero: "FAT-2026-001",
    descricao: "Mensalidade consultoria — Maio/2026 (PROP-2026-001)",
    valor: 5000,
    vencimento: "2026-06-15T12:00:00.000Z",
    status: "Pendente",
    emitidaEm: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "fat-demo-002",
    tenantId: DEMO_TENANT_ID,
    clientId: DEMO_CLIENT_ID,
    numero: "FAT-2026-002",
    descricao: "Implementação CRM — parcela 1 (PROP-2026-002)",
    valor: 4250,
    vencimento: "2026-05-10T12:00:00.000Z",
    status: "Paga",
    emitidaEm: "2026-04-20T10:00:00.000Z",
  },
  {
    id: "fat-acme-001",
    tenantId: ACME_TENANT_ID,
    clientId: ACME_CLIENT_ID,
    numero: "FAT-2026-101",
    descricao: "Automação industrial — entrada 50% (PROP-2026-101)",
    valor: 11000,
    vencimento: "2026-06-20T12:00:00.000Z",
    status: "Pendente",
    emitidaEm: "2026-05-20T10:00:00.000Z",
  },
];

// ─── Projetos (pipeline) ─────────────────────────────────────────────────────

export const pipelineItemsMock: PipelineItem[] = [
  {
    id: "proj-demo-001",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "execucao",
    titulo: "Redesign do site institucional",
    dados: { cliente: "João Cliente", prazo: "2026-07-30", prioridade: "Alta" },
    responsavelId: USER_MARIA,
    clientId: DEMO_CLIENT_ID,
    criadoEm: "2026-04-01T10:00:00.000Z",
    timeline: [
      { tipo: "anotacao", em: "2026-04-01T10:00:00.000Z", texto: "Projeto iniciado (PROP-2026-002 aceita)." },
      { tipo: "anotacao", em: "2026-05-15T14:00:00.000Z", texto: "Wireframes aprovados por João." },
    ],
  },
  {
    id: "proj-demo-002",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "briefing",
    titulo: "Integração com ERP",
    dados: { cliente: "João Cliente", prazo: "2026-09-15", prioridade: "Média" },
    responsavelId: USER_MARIA,
    clientId: DEMO_CLIENT_ID,
    criadoEm: "2026-06-01T09:00:00.000Z",
    timeline: [
      { tipo: "anotacao", em: "2026-06-01T09:00:00.000Z", texto: "Briefing agendado pós-consultoria." },
    ],
  },
  {
    id: "proj-acme-001",
    pipelineId: PROJECTS_PIPELINE_ID,
    stageId: "revisao",
    titulo: "Automação linha de produção",
    dados: { cliente: "Ana Acme", prazo: "2026-08-01", prioridade: "Alta" },
    responsavelId: USER_CARLOS,
    clientId: ACME_CLIENT_ID,
    criadoEm: "2026-03-10T10:00:00.000Z",
    timeline: [
      {
        tipo: "anotacao",
        em: "2026-05-01T10:00:00.000Z",
        texto: "Testes em homologação (PROP-2026-101).",
      },
      {
        tipo: "anotacao",
        em: "2026-06-04T16:00:00.000Z",
        texto: "Pausa parcial — correção integração ERP (cham-acme-001).",
      },
    ],
  },
];

// ─── Configurações por tenant ────────────────────────────────────────────────

const configuracoesDemo: CrmConfiguracoes = {
  metaMensal: 80000,
  empresaNome: "Demo Corp",
  timezone: "America/Sao_Paulo",
  moeda: "BRL",
  smtpHost: "smtp.demo.com",
  smtpPorta: 587,
  smtpUsuario: "operacional@demo.com",
  whatsappConectado: true,
  whatsappNumero: "+55 11 98765-0000",
};

const configuracoesAcme: CrmConfiguracoes = {
  metaMensal: 120000,
  empresaNome: "Acme Indústria",
  timezone: "America/Sao_Paulo",
  moeda: "BRL",
  smtpHost: "mail.acme.com",
  smtpPorta: 465,
  smtpUsuario: "operacional@acme.com",
  whatsappConectado: true,
  whatsappNumero: "+55 19 98765-1234",
};

// ─── Agregados legados (testes / imports) ────────────────────────────────────

export const leadsMock: Lead[] = [...leadsDemo, ...leadsAcme];
export const tarefasMock: Tarefa[] = [...tarefasDemo, ...tarefasAcme];
export const emailsMock: EmailMsg[] = [...emailsDemo, ...emailsAcme];
export const conversasMock: Conversa[] = [...conversasDemo, ...conversasAcme];

// ─── Snapshot por tenant ─────────────────────────────────────────────────────

function filterPipelineItemsForTenant(tenantId: string): PipelineItem[] {
  const clientIds = new Set(
    propostasMock.filter((p) => p.tenantId === tenantId).map((p) => p.clientId),
  );
  chamadosMock.filter((c) => c.tenantId === tenantId).forEach((c) => clientIds.add(c.clientId));
  return pipelineItemsMock.filter((item) => item.clientId && clientIds.has(item.clientId));
}

/** Snapshot CRM inicial correlacionado por tenant — fonte única para seed e client store. */
export function buildMockSnapshotForTenant(tenantId: string): TenantCrmSnapshot {
  if (tenantId === DEMO_TENANT_ID) {
    return {
      leads: leadsDemo,
      tarefas: tarefasDemo,
      emails: emailsDemo,
      conversas: conversasDemo,
      propostas: propostasMock.filter((p) => p.tenantId === tenantId),
      chamados: chamadosMock.filter((c) => c.tenantId === tenantId),
      faturas: faturasMock.filter((f) => f.tenantId === tenantId),
      pipelineItems: filterPipelineItemsForTenant(tenantId),
      usuarios: usuariosDemo,
      configuracoes: configuracoesDemo,
      creator: buildMockCreatorForTenant(tenantId),
    };
  }

  if (tenantId === ACME_TENANT_ID) {
    return {
      leads: leadsAcme,
      tarefas: tarefasAcme,
      emails: emailsAcme,
      conversas: conversasAcme,
      propostas: propostasMock.filter((p) => p.tenantId === tenantId),
      chamados: chamadosMock.filter((c) => c.tenantId === tenantId),
      faturas: faturasMock.filter((f) => f.tenantId === tenantId),
      pipelineItems: filterPipelineItemsForTenant(tenantId),
      usuarios: usuariosAcme,
      configuracoes: configuracoesAcme,
      creator: buildMockCreatorForTenant(tenantId),
    };
  }

  return {
    leads: [],
    tarefas: [],
    emails: [],
    conversas: [],
    propostas: [],
    chamados: [],
    faturas: [],
    pipelineItems: [],
    usuarios: [],
    creator: buildMockCreatorForTenant(tenantId),
  };
}
