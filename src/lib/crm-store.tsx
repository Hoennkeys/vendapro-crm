import * as React from "react";

import {
  addChamadoServerFn,
  getCrmStateServerFn,
  saveCrmStateServerFn,
} from "@/lib/api/crm.functions";
import { useAuth } from "@/lib/auth/auth-store";
import { isClientServerApiEnabled } from "@/lib/client/server-api";
import { useTenant } from "@/lib/tenant/tenant-store";

import {
  vendedoresMock,
  leadsMock,
  tarefasMock,
  emailsMock,
  conversasMock,
  propostasMock,
  chamadosMock,
  faturasMock,
  pipelineItemsMock,
} from "./mock-data";
import { stageIdToEtapa } from "./pipelines/adapter";
import { SALES_PIPELINE_ID } from "./pipelines/defaults";
import type { PipelineItem } from "./pipelines/types";
import type {
  Lead,
  Tarefa,
  EmailMsg,
  Conversa,
  Proposta,
  Usuario,
  Etapa,
  Mensagem,
  TimelineItem,
  Chamado,
  Fatura,
} from "./types";

type State = {
  leads: Lead[];
  tarefas: Tarefa[];
  emails: EmailMsg[];
  conversas: Conversa[];
  propostas: Proposta[];
  chamados: Chamado[];
  faturas: Fatura[];
  pipelineItems: PipelineItem[];
  usuarios: Usuario[];
  filtroVendedor: string; // "todos" | userId
};

type Ctx = State & {
  setFiltroVendedor: (v: string) => void;
  moverLead: (id: string, etapa: Etapa) => void;
  moverPipelineItem: (pipelineId: string, itemId: string, stageId: string) => void;
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
  adicionarProposta: (
    p: Omit<Proposta, "id" | "numero" | "criadaEm" | "status"> & { status?: Proposta["status"] },
  ) => Proposta;
  atualizarStatusProposta: (id: string, status: Proposta["status"]) => void;
  adicionarChamado: (
    c: Omit<Chamado, "id" | "criadoEm" | "atualizadoEm" | "status"> & {
      status?: Chamado["status"];
    },
  ) => Chamado;
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
  chamados: chamadosMock,
  faturas: faturasMock,
  pipelineItems: pipelineItemsMock,
  usuarios: vendedoresMock,
  filtroVendedor: "todos",
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function snapshotFromState(state: State) {
  const { filtroVendedor: _, ...snapshot } = state;
  return snapshot;
}

type CrmProviderProps = {
  children: React.ReactNode;
  tenantId: string;
};

export function CrmProvider({ children, tenantId }: CrmProviderProps) {
  const { session } = useAuth();
  const [state, setState] = React.useState<State>(initial);
  const [hydrated, setHydrated] = React.useState(false);
  const [persistEnabled, setPersistEnabled] = React.useState(false);
  const useServerApi = isClientServerApiEnabled();
  const isClientUser = session?.user.clientRole === "CLIENT";

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (useServerApi) {
        try {
          const remote = await getCrmStateServerFn({ data: { tenantId } });
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              ...remote,
              filtroVendedor: prev.filtroVendedor,
            }));
          }
        } catch {
          // mantém estado inicial se API falhar
        }
        if (!cancelled) setHydrated(true);
        return;
      }

      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<State>;
          if (!cancelled) {
            setState({
              ...initial,
              ...parsed,
              chamados: parsed.chamados ?? chamadosMock,
              faturas: parsed.faturas ?? faturasMock,
              pipelineItems: parsed.pipelineItems ?? pipelineItemsMock,
            });
          }
        }
      } catch {
        // localStorage indisponível ou JSON corrompido — mantém estado inicial
      }
      if (!cancelled) setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [tenantId, useServerApi]);

  React.useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => setPersistEnabled(true), 400);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  React.useEffect(() => {
    if (!hydrated || !persistEnabled) return;

    if (useServerApi) {
      if (isClientUser) return;
      const timer = window.setTimeout(() => {
        void saveCrmStateServerFn({
          data: { tenantId, snapshot: snapshotFromState(state) },
        }).catch(() => {
          // falha silenciosa — usuário operacional pode retentar com próxima alteração
        });
      }, 600);
      return () => window.clearTimeout(timer);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota excedida ou storage bloqueado
    }
  }, [state, hydrated, persistEnabled, tenantId, useServerApi, isClientUser]);

  const value: Ctx = React.useMemo(
    () => ({
      ...state,
      setFiltroVendedor: (v) => setState((s) => ({ ...s, filtroVendedor: v })),
      moverLead: (id, etapa) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, etapa } : l)),
        })),
      moverPipelineItem: (pipelineId, itemId, stageId) => {
        if (pipelineId !== SALES_PIPELINE_ID) return;
        const etapa = stageIdToEtapa(stageId);
        if (!etapa) return;
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === itemId ? { ...l, etapa } : l)),
        }));
      },
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
            ? s.conversas.map((c) => (c.id === opts.conversaId ? { ...c, leadId: novo.id } : c))
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
      adicionarChamado: (c) => {
        const agora = new Date().toISOString();
        const optimistic: Chamado = {
          ...c,
          id: uid("ch"),
          status: c.status ?? "Aberto",
          criadoEm: agora,
          atualizadoEm: agora,
        };

        if (useServerApi && isClientUser) {
          setState((s) => ({ ...s, chamados: [optimistic, ...s.chamados] }));
          void addChamadoServerFn({
            data: {
              tenantId,
              clientId: c.clientId,
              titulo: c.titulo,
              descricao: c.descricao,
            },
          })
            .then((salvo) => {
              setState((s) => ({
                ...s,
                chamados: [salvo, ...s.chamados.filter((item) => item.id !== optimistic.id)],
              }));
            })
            .catch(() => {
              setState((s) => ({
                ...s,
                chamados: s.chamados.filter((item) => item.id !== optimistic.id),
              }));
            });
          return optimistic;
        }

        setState((s) => ({ ...s, chamados: [optimistic, ...s.chamados] }));
        return optimistic;
      },
      adicionarUsuario: (u) =>
        setState((s) => ({ ...s, usuarios: [...s.usuarios, { ...u, id: uid("u") }] })),
      alternarUsuarioAtivo: (id) =>
        setState((s) => ({
          ...s,
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)),
        })),
    }),
    [state, tenantId, useServerApi, isClientUser],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function CrmProviderWithTenant({ children }: { children: React.ReactNode }) {
  const { whiteLabel } = useTenant();
  return <CrmProvider tenantId={whiteLabel.tenantId}>{children}</CrmProvider>;
}

export function useCrm() {
  const ctx = React.useContext(CrmContext);
  if (!ctx) throw new Error("useCrm precisa de CrmProvider");
  return ctx;
}

export function nomeVendedor(usuarios: Usuario[], id: string) {
  return usuarios.find((u) => u.id === id)?.nome ?? "—";
}
