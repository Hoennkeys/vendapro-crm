import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChatsPanel } from "@/components/comunicacao/chats-panel";
import { EmailsPanel } from "@/components/comunicacao/emails-panel";
import { useCrm } from "@/lib/crm-store";

type ComunicacaoTab = "chats" | "emails";

type ComunicacaoSearch = {
  tab: ComunicacaoTab;
};

export const Route = createFileRoute("/t/$tenantSlug/app/comunicacao")({
  validateSearch: (search: Record<string, unknown>): ComunicacaoSearch => ({
    tab: search.tab === "emails" ? "emails" : "chats",
  }),
  head: () => ({ meta: [{ title: "Comunicação — VendaPro CRM" }] }),
  component: Comunicacao,
});

function Comunicacao() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { conversas, emails } = useCrm();

  const chatsNaoLidas = conversas.reduce((acc, c) => acc + c.naoLidas, 0);
  const emailsNaoLidos = emails.filter(
    (e) => e.pasta === "Caixa de Entrada" && !e.lida,
  ).length;

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
          <ChatsPanel />
        </TabsContent>
        <TabsContent value="emails" className="mt-4 min-h-0 flex-1 data-[state=inactive]:hidden">
          <EmailsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
