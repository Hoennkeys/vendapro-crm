import * as React from "react";
import { toast } from "sonner";
import { Phone, Search, UserPlus, Save, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-store";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brDate } from "@/lib/format";
import { aplicarTemplate, emailTemplates } from "@/lib/email-templates";
import { findLegacyConversaId, findLegacyEmailId } from "../../domain/legacy-adapter";
import type { CommunicationChannelType, Conversation } from "../../domain/entities";
import { useCommunications } from "../../store/communications-context";
import { useInbox, useConversationMessages } from "../../hooks/queries/inbox.queries";
import { ChannelFilterBar } from "./channel-filter-bar";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { MessageComposer } from "./message-composer";
import { CREATOR_TERMS } from "@/modules/creator/domain/terminology";

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export type InboxLayoutProps = {
  initialChannel?: CommunicationChannelType;
  initialConversationId?: string;
  draftMessage?: string;
  clientId?: string;
};

export function InboxLayout({
  initialChannel,
  initialConversationId,
  draftMessage,
}: InboxLayoutProps) {
  const { session } = useAuth();
  const crm = useCrm();
  const { hub, tenantId, visibleConversations, snapshot } = useCommunications();
  const queryClient = useQueryClient();

  const [channelFilter, setChannelFilter] = React.useState<CommunicationChannelType | "all">(
    initialChannel ?? "all",
  );
  const [activeId, setActiveId] = React.useState<string | undefined>(initialConversationId);
  const [busca, setBusca] = React.useState("");
  const [texto, setTexto] = React.useState(draftMessage ?? "");
  const [composeEmail, setComposeEmail] = React.useState(false);

  const filters = React.useMemo(
    () => ({
      channelType: channelFilter === "all" ? undefined : channelFilter,
      search: busca || undefined,
    }),
    [channelFilter, busca],
  );

  const { data: conversations = visibleConversations } = useInbox(filters);
  const { data: messages = [] } = useConversationMessages(activeId);

  const active = activeId ? conversations.find((c) => c.id === activeId) : undefined;

  const messagesByConv = React.useMemo(() => {
    const map: Record<string, typeof snapshot.messages> = {};
    for (const c of conversations) {
      map[c.id] = snapshot.messages.filter((m) => m.conversationId === c.id);
    }
    return map;
  }, [conversations, snapshot.messages]);

  React.useEffect(() => {
    if (initialConversationId) {
      setActiveId(initialConversationId);
      hub.markConversationRead(initialConversationId);
    }
  }, [initialConversationId, hub]);

  React.useEffect(() => {
    if (draftMessage) setTexto(draftMessage);
  }, [draftMessage]);

  const selectConversation = (id: string) => {
    setActiveId(id);
    hub.markConversationRead(id);
    const conv = conversations.find((c) => c.id === id);
    const legacyId = conv ? findLegacyConversaId(conv) : undefined;
    if (legacyId) crm.marcarConversaLida(legacyId);
  };

  const syncLegacyMessage = (conv: Conversation, body: string) => {
    const legacyConversaId = findLegacyConversaId(conv);
    if (legacyConversaId) crm.enviarMensagem(legacyConversaId, body);
    const legacyEmailId = findLegacyEmailId(conv);
    if (legacyEmailId && conv.channelType === "email") {
      crm.marcarEmailLido(legacyEmailId);
    }
  };

  const sendMessage = async () => {
    if (!active || !texto.trim()) return;
    const body = texto.trim();
    await hub.sendMessage(active.channelType, {
      conversationId: active.id,
      body,
      metadata: { authorId: session?.user.id },
    });
    syncLegacyMessage(active, body);
    setTexto("");
    void queryClient.invalidateQueries({ queryKey: ["communications", tenantId] });
  };

  const sendInternalNote = (body: string) => {
    if (!active || !session?.user.id) return;
    hub.addInternalNote({
      conversationId: active.id,
      authorId: session.user.id,
      body,
    });
    void queryClient.invalidateQueries({ queryKey: ["communications", tenantId] });
    toast.success("Nota interna adicionada");
  };

  const legacyConversa = active?.legacyConversaId
    ? crm.conversas.find((c) => c.id === active.legacyConversaId)
    : undefined;
  const leadVinculado = legacyConversa?.leadId
    ? crm.leads.find((l) => l.id === legacyConversa.leadId)
    : active?.leadId
      ? crm.leads.find((l) => l.id === active.leadId)
      : undefined;

  const criarOportunidade = () => {
    if (!legacyConversa) {
      toast.info("Disponível para conversas de chat interno vinculadas.");
      return;
    }
    if (legacyConversa.leadId) {
      toast.info(`Esta conversa já está vinculada a uma ${CREATOR_TERMS.lead.toLowerCase()} no pipeline.`);
      return;
    }
    const novo = crm.adicionarLead(
      {
        cliente: legacyConversa.contatoEmpresa,
        contato: legacyConversa.contatoNome,
        email: `${legacyConversa.contatoNome.split(" ")[0].toLowerCase()}@empresa.com.br`,
        telefone: legacyConversa.telefone,
        valor: 5000,
        etapa: "Sem Contato",
        prioridade: "Média",
        responsavelId: legacyConversa.agenteId,
      },
      { conversaId: legacyConversa.id },
    );
    toast.success(`Oportunidade criada: ${novo.cliente}`);
  };

  const salvarHistorico = () => {
    if (!legacyConversa?.leadId && !legacyConversa) return;
    let leadId = legacyConversa.leadId;
    if (!leadId && legacyConversa) {
      const novo = crm.adicionarLead(
        {
          cliente: legacyConversa.contatoEmpresa,
          contato: legacyConversa.contatoNome,
          email: "",
          telefone: legacyConversa.telefone,
          valor: 0,
          etapa: "Sem Contato",
          prioridade: "Baixa",
          responsavelId: legacyConversa.agenteId,
        },
        { conversaId: legacyConversa.id },
      );
      leadId = novo.id;
    }
    const resumo = messages.map((m) => `${m.authorRole}: ${m.body}`).join(" | ");
    crm.adicionarTimeline(leadId!, {
      tipo: "mensagem",
      em: new Date().toISOString(),
      texto: `Histórico salvo: ${resumo.slice(0, 200)}${resumo.length > 200 ? "…" : ""}`,
    });
    toast.success(`Histórico salvo no perfil da ${CREATOR_TERMS.client.toLowerCase()}`);
  };

  const displayName = (c: Conversation) =>
    c.subject ?? c.participants.find((p) => p.role === "client")?.name ?? "Conversa";

  return (
    <div className="flex h-full flex-col gap-2">
      {channelFilter === "email" || conversations.some((c) => c.channelType === "email") ? (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setComposeEmail(true)}>
            <Pencil className="h-4 w-4" /> Escrever e-mail
          </Button>
        </div>
      ) : null}

      <Card className="grid grid-cols-12 flex-1 min-h-0 overflow-hidden p-0">
        <div className="col-span-12 md:col-span-3 border-r flex flex-col">
          <ChannelFilterBar value={channelFilter} onChange={setChannelFilter} />
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar conversas..."
                className="pl-8"
              />
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            messagesByConv={messagesByConv}
            activeId={activeId}
            onSelect={selectConversation}
          />
        </div>

        <div className="col-span-12 md:col-span-6 flex flex-col bg-muted/20">
          {active ? (
            <>
              <div className="p-3 border-b bg-background flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {iniciais(displayName(active))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{displayName(active)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{active.channelType}</p>
                </div>
                {active.assignedEmployeeId && (
                  <Badge variant="outline" className="text-xs">
                    {nomeVendedor(crm.usuarios, active.assignedEmployeeId)}
                  </Badge>
                )}
              </div>
              <ConversationThread conversation={active} messages={messages} />
              <MessageComposer
                value={texto}
                onChange={setTexto}
                onSend={() => void sendMessage()}
                onInternalNote={sendInternalNote}
                multiline={active.channelType === "email"}
                placeholder={
                  active.channelType === "email" ? "Responder e-mail..." : "Digite uma mensagem..."
                }
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm text-center px-6">
              Selecione uma conversa no Inbox omnichannel
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-3 border-l flex flex-col">
          {active && legacyConversa && (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {iniciais(legacyConversa.contatoNome)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{legacyConversa.contatoNome}</p>
                  <p className="text-xs text-muted-foreground">{legacyConversa.contatoEmpresa}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {legacyConversa.telefone}
                  </div>
                </div>
                <Separator />
                {leadVinculado ? (
                  <div className="rounded-md border p-2 text-sm">
                    <p className="font-medium">{leadVinculado.cliente}</p>
                    <p className="text-xs text-muted-foreground">Etapa: {leadVinculado.etapa}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem {CREATOR_TERMS.lead.toLowerCase()} vinculada.
                  </p>
                )}
                <Button className="w-full" onClick={criarOportunidade}>
                  <UserPlus className="h-4 w-4" /> Criar Oportunidade
                </Button>
                <Button variant="outline" className="w-full" onClick={salvarHistorico}>
                  <Save className="h-4 w-4" /> Salvar no perfil da {CREATOR_TERMS.client}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Última atividade: {brDate(active.lastMessageAt)}
                </p>
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>

      <ComposeEmailDialog
        open={composeEmail}
        onOpenChange={setComposeEmail}
        onSend={(e) => {
          crm.enviarEmail(e);
          toast.success("E-mail enviado!");
          setComposeEmail(false);
          void queryClient.invalidateQueries({ queryKey: ["communications", tenantId] });
        }}
      />
    </div>
  );
}

function ComposeEmailDialog({
  open,
  onOpenChange,
  onSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSend: (e: { de: string; para: string; assunto: string; corpo: string }) => void;
}) {
  const [para, setPara] = React.useState("");
  const [assunto, setAssunto] = React.useState("");
  const [corpo, setCorpo] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setPara("");
      setAssunto("");
      setCorpo("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escrever E-mail</DialogTitle>
          <DialogDescription>Use um modelo ou escreva do zero.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Modelos</Label>
            <Select
              onValueChange={(id) => {
                const t = emailTemplates.find((x) => x.id === id);
                if (!t) return;
                const { assunto: a, corpo: c } = aplicarTemplate(t, para.split("@")[0] || "cliente", "Administrador");
                setAssunto(a);
                setCorpo(c);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Para</Label>
            <Input value={para} onChange={(e) => setPara(e.target.value)} />
          </div>
          <div>
            <Label>Assunto</Label>
            <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          </div>
          <div>
            <Label>Mensagem</Label>
            <Textarea rows={8} value={corpo} onChange={(e) => setCorpo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSend({ de: "admin@vendapro.com.br", para, assunto, corpo })}
            disabled={!para || !assunto}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
