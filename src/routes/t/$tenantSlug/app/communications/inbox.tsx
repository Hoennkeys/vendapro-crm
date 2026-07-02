import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import { InboxLayout } from "@/modules/communications/components/inbox/inbox-layout";
import { parseInboxSearch } from "@/modules/communications/routes/legacy-redirect";
import { buildChamadoGreetingMessage } from "@/lib/comunicacao/chamado-greeting";
import {
  buildConversaFromClient,
  resolveConversaForClient,
} from "@/lib/comunicacao/conversa-resolver";
import { findClientById } from "@/lib/clients-registry";
import { useAuth } from "@/lib/auth/auth-store";
import { useCrm } from "@/lib/crm-store";
import { useCommunications } from "@/modules/communications/store/communications-context";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/inbox")({
  validateSearch: (search: Record<string, unknown>) => parseInboxSearch(search),
  head: () => ({ meta: [{ title: "Inbox — Comunicações" }] }),
  component: InboxPage,
});

function InboxPage() {
  const search = Route.useSearch();
  const { session } = useAuth();
  const { conversas, leads, chamados, adicionarConversa } = useCrm();
  const { snapshot } = useCommunications();
  const [bootstrap, setBootstrap] = React.useState<{
    conversationId?: string;
    draftMessage?: string;
  }>({});

  React.useEffect(() => {
    if (!search.clientId && !search.conversationId && !search.chamadoId) return;
    const agenteId = session?.user.id;
    if (!agenteId) return;

    let legacyConversaId = search.conversationId;
    if (!legacyConversaId && search.clientId) {
      const existing = resolveConversaForClient(conversas, leads, search.clientId);
      if (existing) {
        legacyConversaId = existing.id;
      } else {
        const draft = buildConversaFromClient(search.clientId, leads, agenteId);
        if (!draft) {
          toast.error("Cliente não encontrado.");
          return;
        }
        legacyConversaId = adicionarConversa(draft).id;
      }
    }

    const unified = snapshot.conversations.find(
      (c) => c.legacyConversaId === legacyConversaId,
    );
    const chamado = search.chamadoId
      ? chamados.find((c) => c.id === search.chamadoId)
      : undefined;
    const clientId = search.clientId ?? chamado?.clientId;
    const clientName = clientId ? findClientById(clientId)?.nome ?? "cliente" : "cliente";
    const draftMessage =
      chamado && clientId
        ? buildChamadoGreetingMessage(clientName, chamado.titulo)
        : undefined;

    setBootstrap({
      conversationId: unified?.id ?? legacyConversaId,
      draftMessage,
    });
  }, [
    search.clientId,
    search.conversationId,
    search.chamadoId,
    conversas,
    leads,
    chamados,
    session?.user.id,
    adicionarConversa,
    snapshot.conversations,
  ]);

  return (
    <InboxLayout
      initialChannel={search.channel}
      initialConversationId={bootstrap.conversationId ?? search.conversationId}
      draftMessage={bootstrap.draftMessage}
      clientId={search.clientId}
    />
  );
}
