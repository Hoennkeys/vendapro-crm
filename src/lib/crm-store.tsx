import * as React from "react";
import {
  vendedoresMock,
  leadsMock,
  tarefasMock,
  emailsMock,
  conversasMock,
  propostasMock,
} from "./mock-data";
import type {
  Lead, Tarefa, EmailMsg, Conversa, Proposta, Usuario, Etapa, Mensagem, TimelineItem,
} from "./types";

type State = {
  leads: Lead[];
  tarefas: Tarefa[];
  emails: EmailMsg[];
  conversas: Conversa[];
  propostas: Proposta[];
  usuarios: Usuario[];
  filtroVendedor: string; // "todos" | userId
};

type Ctx = State & {
  setFiltroVendedor: (v: string) => void;
  moverLead: (id: string, etapa: Etapa) => void;
  adicionarLead: (
    lead: Omit<Lead, "id" | "criadoEm" | "timeline"> & Partial<Pick<Lead, "timeline">>,
    opts?: { conversaId?: string },
  ) => Lead;
  adicionarTimeline: (leadId: string, item: TimelineItem) => void;
  toggleTarefa: (id: string) => void;
  adicionarTarefa: (t: Omit<Tarefa, "id">) => void;
  enviarEmail: (e: Omit<EmailMsg, "id" | "em" | "pasta" | "lida">) => void;
  marcarEmailLido: (id: string) => void;
  enviarMensagem: (conversaId: string, texto: string) => void;
  marcarConversaLida: (conversaId: string) => void;
  adicionarProposta: (p: Omit<Proposta, "id" | "numero" | "criadaEm" | "status"> & { status?: Proposta["status"] }) => Proposta;
  atualizarStatusProposta: (id: string, status: Proposta["status"]) => void;
  adicionarUsuario: (u: Omit<Usuario, "id">) => void;
  alternarUsuarioAtivo: (id: string) => void;
};

const CrmContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "vendapro_crm_state_v2";
const LEGACY_STORAGE_KEY = "vendapro_crm_state_v1";

const initial: State = {
  leads: leadsMock,
  tarefas: tarefasMock,
  emails: emailsMock,
  conversas: conversasMock,
  propostas: propostasMock,
  usuarios: vendedoresMock,
  filtroVendedor: "todos",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const value: Ctx = React.useMemo(
    () => ({
      ...state,
      setFiltroVendedor: (v) => setState((s) => ({ ...s, filtroVendedor: v })),
      moverLead: (id, etapa) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, etapa } : l)),
        })),
      adicionarLead: (lead, opts) => {
        const novo: Lead = {
          ...lead,
          id: uid("l"),
          criadoEm: new Date().toISOString(),
          timeline: lead.timeline ?? [],
        };
        setState((s) => ({
          ...s,
          leads: [novo, ...s.leads],
          conversas: opts?.conversaId
            ? s.conversas.map((c) =>
                c.id === opts.conversaId ? { ...c, leadId: novo.id } : c,
              )
            : s.conversas,
        }));
        return novo;
      },
      adicionarTimeline: (leadId, item) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === leadId ? { ...l, timeline: [...l.timeline, item] } : l,
          ),
        })),
      toggleTarefa: (id) =>
        setState((s) => ({
          ...s,
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)),
        })),
      adicionarTarefa: (t) =>
        setState((s) => ({ ...s, tarefas: [{ ...t, id: uid("t") }, ...s.tarefas] })),
      enviarEmail: (e) => {
        const novo: EmailMsg = {
          ...e,
          id: uid("e"),
          em: new Date().toISOString(),
          pasta: "Enviados",
          lida: true,
        };
        setState((s) => ({ ...s, emails: [novo, ...s.emails] }));
      },
      marcarEmailLido: (id) =>
        setState((s) => ({
          ...s,
          emails: s.emails.map((e) => (e.id === id ? { ...e, lida: true } : e)),
        })),
      enviarMensagem: (conversaId, texto) =>
        setState((s) => ({
          ...s,
          conversas: s.conversas.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  mensagens: [
                    ...c.mensagens,
                    {
                      id: uid("m"),
                      autor: "agente",
                      texto,
                      em: new Date().toISOString(),
                      lida: true,
                    } as Mensagem,
                  ],
                }
              : c,
          ),
        })),
      marcarConversaLida: (conversaId) =>
        setState((s) => {
          const alvo = s.conversas.find((c) => c.id === conversaId);
          if (!alvo || alvo.naoLidas === 0) return s;
          return {
            ...s,
            conversas: s.conversas.map((c) =>
              c.id === conversaId
                ? {
                    ...c,
                    naoLidas: 0,
                    mensagens: c.mensagens.map((m) =>
                      m.autor === "cliente" ? { ...m, lida: true } : m,
                    ),
                  }
                : c,
            ),
          };
        }),
      adicionarProposta: (p) => {
        let nova!: Proposta;
        setState((s) => {
          const numero = `PROP-${new Date().getFullYear()}-${String(
            s.propostas.length + 1,
          ).padStart(3, "0")}`;
          nova = {
            ...p,
            id: uid("p"),
            numero,
            criadaEm: new Date().toISOString(),
            status: p.status ?? "Pendente",
          };
          return { ...s, propostas: [nova, ...s.propostas] };
        });
        return nova;
      },
      atualizarStatusProposta: (id, status) =>
        setState((s) => ({
          ...s,
          propostas: s.propostas.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      adicionarUsuario: (u) =>
        setState((s) => ({ ...s, usuarios: [...s.usuarios, { ...u, id: uid("u") }] })),
      alternarUsuarioAtivo: (id) =>
        setState((s) => ({
          ...s,
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)),
        })),
    }),
    [state],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = React.useContext(CrmContext);
  if (!ctx) throw new Error("useCrm precisa de CrmProvider");
  return ctx;
}

export function nomeVendedor(usuarios: Usuario[], id: string) {
  return usuarios.find((u) => u.id === id)?.nome ?? "—";
}