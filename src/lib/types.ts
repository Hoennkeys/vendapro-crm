export type Etapa = "Sem Contato" | "Em Atendimento" | "Proposta Enviada" | "Ganho" | "Perdido";
export type Prioridade = "Alta" | "Média" | "Baixa";
export type Papel = "Administrador" | "Vendedor";

export type TimelineItem = {
  tipo: "ligacao" | "email" | "mensagem" | "anotacao";
  em: string;
  texto: string;
};

export type Lead = {
  id: string;
  cliente: string;
  contato: string;
  email: string;
  telefone: string;
  valor: number;
  etapa: Etapa;
  prioridade: Prioridade;
  responsavelId: string;
  criadoEm: string;
  timeline: TimelineItem[];
};

export type Tarefa = {
  id: string;
  titulo: string;
  responsavelId: string;
  prazo: string;
  prioridade: Prioridade;
  concluida: boolean;
  leadId?: string;
};

export type EmailMsg = {
  id: string;
  de: string;
  para: string;
  assunto: string;
  corpo: string;
  em: string;
  pasta: "Caixa de Entrada" | "Enviados" | "Rascunhos" | "Lixeira";
  lida: boolean;
};

export type Mensagem = {
  id: string;
  autor: "agente" | "cliente";
  texto: string;
  em: string;
  lida: boolean;
};

export type Conversa = {
  id: string;
  contatoNome: string;
  contatoEmpresa: string;
  telefone: string;
  leadId?: string;
  agenteId: string;
  naoLidas: number;
  mensagens: Mensagem[];
};

export type ItemProposta = { descricao: string; qtd: number; valorUnit: number };

export type StatusProposta = "Pendente" | "Aceita" | "Vencida";

export type Proposta = {
  id: string;
  tenantId: string;
  clientId: string;
  numero: string;
  cliente: string;
  cnpj: string;
  valor: number;
  criadaEm: string;
  validade: string;
  status: StatusProposta;
  responsavelId: string;
  itens: ItemProposta[];
  condicoes: string;
  observacoes: string;
};

export type StatusChamado = "Aberto" | "Em andamento" | "Resolvido" | "Fechado";

export type Chamado = {
  id: string;
  tenantId: string;
  clientId: string;
  titulo: string;
  descricao: string;
  status: StatusChamado;
  criadoEm: string;
  atualizadoEm: string;
};

export type StatusFatura = "Pendente" | "Paga" | "Vencida" | "Cancelada";

export type Fatura = {
  id: string;
  tenantId: string;
  clientId: string;
  numero: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusFatura;
  emitidaEm: string;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
};
