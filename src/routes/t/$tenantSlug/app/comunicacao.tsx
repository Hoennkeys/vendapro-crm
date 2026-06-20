import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChatsPanel } from "@/components/comunicacao/chats-panel";
import { EmailsPanel } from "@/components/comunicacao/emails-panel";
import { buildChamadoGreetingMessage } from "@/lib/comunicacao/chamado-greeting";
import {
  buildConversaFromClient,
  resolveConversaForClient,
} from "@/lib/comunicacao/conversa-resolver";
import { findClientById } from "@/lib/clients-registry";
import { useAuth } from "@/lib/auth/auth-store";
import { useCrm } from "@/lib/crm-store";

type ComunicacaoTab = "chats" | "emails";

export type ComunicacaoSearch = {
  tab: ComunicacaoTab;
  chamadoId?: string;
  clientId?: string;
  chatId?: string;
};

type ChatBootstrap = {
  initialChatId: string;
  draftMessage: string;
};

function optionalSearchString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const Route = createFileRoute("/t/$tenantSlug/app/comunicacao")({
  validateSearch: (search: Record<string, unknown>): ComunicacaoSearch => ({
    tab: search.tab === "emails" ? "emails" : "chats",
    chamadoId: optionalSearchString(search.chamadoId),
    clientId: optionalSearchString(search.clientId),
    chatId: optionalSearchString(search.chatId),
  }),
  head: () => ({ meta: [{ title: "Comunicação — VendaPro CRM" }] }),
  component: Comunicacao,
});

function Comunicacao() {
  const { tab, chamadoId, clientId, chatId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { session } = useAuth();
  const { conversas, emails, chamados, leads, adicionarConversa } = useCrm();
  const [chatBootstrap, setChatBootstrap] = React.useState<ChatBootstrap | null>(null);
  const processedDeepLinkRef = React.useRef<string | null>(null);

  const chatsNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);
  const emailsNaoLidos = emails.filter(
    (e) => e.pasta === "Caixa de Entrada" && !e.lida,
  ).length;

  React.useEffect(() => {
    if (tab !== "chats") return;
    if (!clientId && !chatId) return;

    const deepLinkKey = `${chamadoId ?? ""}|${clientId ?? ""}|${chatId ?? ""}`;
    if (processedDeepLinkRef.current === deepLinkKey) return;

    const agenteId = session?.user.id;
    if (!agenteId) {
      toast.error("Sessão inválida. Faça login novamente.");
      navigate({ search: { tab: "chats" }, replace: true });
      return;
    }

    let conversaId = chatId;

    if (!conversaId && clientId) {
      const existing = resolveConversaForClient(conversas, leads, clientId);
      if (existing) {
        conversaId = existing.id;
      } else {
        const draftConversa = buildConversaFromClient(clientId, leads, agenteId);
        if (!draftConversa) {
          toast.error("Cliente não encontrado. Não foi possível iniciar o chat.");
          navigate({ search: { tab: "chats" }, replace: true });
          return;
        }
        const nova = adicionarConversa(draftConversa);
        conversaId = nova.id;
        toast.success(`Conversa iniciada para ${draftConversa.contatoNome}`);
      }
    }

    if (!conversaId) {
      navigate({ search: { tab: "chats" }, replace: true });
      return;
    }

    const chamado = chamadoId ? chamados.find((item) => item.id === chamadoId) : undefined;
    const resolvedClientId = clientId ?? chamado?.clientId;
    const clienteNome = resolvedClientId
      ? (findClientById(resolvedClientId)?.nome ?? "cliente")
      : "cliente";

    const draftMessage =
      chamado && resolvedClientId
        ? buildChamadoGreetingMessage(clienteNome, chamado.titulo)
        : "";

    processedDeepLinkRef.current = deepLinkKey;
    setChatBootstrap({ initialChatId: conversaId, draftMessage });
    navigate({ search: { tab: "chats" }, replace: true });
  }, [
    tab,
    chamadoId,
    clientId,
    chatId,
    conversas,
    leads,
    chamados,
    session?.user.id,
    adicionarConversa,
    navigate,
  ]);

  const onTabChange = (value: string) => {
    navigate({
      search: { tab: value as ComunicacaoTab },
      replace: true,
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Comunicação</h1>
        <p className="text-sm text-muted-foreground">
          Chats e e-mails unificados para atendimento comercial.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="w-fit shrink-0">
          <TabsTrigger value="chats" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chats
            {chatsNaoLidas > 0 && (
              <Badge className="h-5 bg-emerald-600 px-1.5 text-[10px] text-white">
                {chatsNaoLidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            E-mails
            {emailsNaoLidos > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {emailsNaoLidos}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="mt-4 min-h-0 flex-1 data-[state=inactive]:hidden">
          <ChatsPanel
            initialChatId={chatBootstrap?.initialChatId}
            draftMessage={chatBootstrap?.draftMessage}
          />
        </TabsContent>
        <TabsContent value="emails" className="mt-4 min-h-0 flex-1 data-[state=inactive]:hidden">
          <EmailsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
