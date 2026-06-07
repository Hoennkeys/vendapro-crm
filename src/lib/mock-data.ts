import type { Lead, Tarefa, EmailMsg, Conversa, Proposta, Usuario, Etapa } from "./types";

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
export const propostasMock: Proposta[] = [];
