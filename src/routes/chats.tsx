import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send, Phone, Search, Paperclip, Smile, UserPlus, Save, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brTime, brDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chats")({
  head: () => ({ meta: [{ title: "Central de Chats — VendaPro CRM" }] }),
  component: Chats,
});

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Chats() {
  const {
    conversas, usuarios, leads, enviarMensagem, adicionarLead, adicionarTimeline, marcarConversaLida,
  } = useCrm();
  const [ativaId, setAtivaId] = React.useState(conversas[0]?.id);
  const [busca, setBusca] = React.useState("");
  const [texto, setTexto] = React.useState("");
  const ativa = conversas.find((c) => c.id === ativaId) ?? conversas[0];

  const selecionarConversa = (id: string) => {
    setAtivaId(id);
    marcarConversaLida(id);
  };

  React.useEffect(() => {
    const id = conversas[0]?.id;
    if (id) marcarConversaLida(id);
  }, []);

  const filtradas = conversas.filter(
    (c) => c.contatoNome.toLowerCase().includes(busca.toLowerCase())
      || c.contatoEmpresa.toLowerCase().includes(busca.toLowerCase()),
  );

  const enviar = () => {
    if (!texto.trim() || !ativa) return;
    enviarMensagem(ativa.id, texto.trim());
    setTexto("");
  };

  const criarOportunidade = () => {
    if (!ativa) return;
    if (ativa.leadId) {
      toast.info("Esta conversa já está vinculada a um lead no funil.");
      return;
    }
    const novo = adicionarLead(
      {
        cliente: ativa.contatoEmpresa,
        contato: ativa.contatoNome,
        email: `${ativa.contatoNome.split(" ")[0].toLowerCase()}@${ativa.contatoEmpresa.toLowerCase().replace(/[^a-z]/g, "")}.com.br`,
        telefone: ativa.telefone,
        valor: 5000,
        etapa: "Sem Contato",
        prioridade: "Média",
        responsavelId: ativa.agenteId,
      },
      { conversaId: ativa.id },
    );
    toast.success(`Oportunidade criada: ${novo.cliente}`, { description: "Adicionada à etapa Sem Contato." });
  };

  const salvarHistorico = () => {
    if (!ativa) return;
    let leadId = ativa.leadId;
    if (!leadId) {
      const novo = adicionarLead(
        {
          cliente: ativa.contatoEmpresa,
          contato: ativa.contatoNome,
          email: "",
          telefone: ativa.telefone,
          valor: 0,
          etapa: "Sem Contato",
          prioridade: "Baixa",
          responsavelId: ativa.agenteId,
        },
        { conversaId: ativa.id },
      );
      leadId = novo.id;
    }
    const resumo = ativa.mensagens.map((m) => `${m.autor === "agente" ? "Agente" : "Cliente"}: ${m.texto}`).join(" | ");
    adicionarTimeline(leadId!, {
      tipo: "mensagem",
      em: new Date().toISOString(),
      texto: `Histórico de WhatsApp salvo: ${resumo.slice(0, 200)}${resumo.length > 200 ? "…" : ""}`,
    });
    toast.success("Histórico salvo no CRM");
  };

  const leadVinculado = ativa?.leadId ? leads.find((l) => l.id === ativa.leadId) : undefined;

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Central de Chats</h1>
        <p className="text-sm text-muted-foreground mb-4">Atendimento multi-agente integrado ao WhatsApp.</p>
      </div>
      <Card className="grid grid-cols-12 h-[calc(100%-3rem)] overflow-hidden p-0">
        {/* Lista de conversas */}
        <div className="col-span-12 md:col-span-3 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conversas..." className="pl-8" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filtradas.map((c) => (
              <button
                key={c.id}
                onClick={() => selecionarConversa(c.id)}
                className={cn(
                  "w-full text-left p-3 border-b hover:bg-accent/50 flex gap-3 items-start transition-colors",
                  ativa?.id === c.id && "bg-accent",
                )}
              >
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs">{iniciais(c.contatoNome)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-sm font-medium truncate">{c.contatoNome}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{c.mensagens.length ? brTime(c.mensagens[c.mensagens.length - 1].em) : ""}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.contatoEmpresa}</p>
                  <p className="text-xs truncate text-muted-foreground">{c.mensagens[c.mensagens.length - 1]?.texto ?? ""}</p>
                </div>
                {c.naoLidas > 0 && <Badge className="bg-emerald-600 text-white text-[10px] h-5">{c.naoLidas}</Badge>}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Thread */}
        <div className="col-span-12 md:col-span-6 flex flex-col bg-muted/20">
          {ativa ? (
            <>
              <div className="p-3 border-b bg-background flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs">{iniciais(ativa.contatoNome)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ativa.contatoNome}</p>
                  <p className="text-xs text-muted-foreground">{ativa.telefone}</p>
                </div>
                <Badge variant="outline" className="text-xs">Atendido por {nomeVendedor(usuarios, ativa.agenteId)}</Badge>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {ativa.mensagens.map((m) => (
                    <div key={m.id} className={cn("flex", m.autor === "agente" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        m.autor === "agente"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border rounded-bl-sm",
                      )}>
                        <p className="whitespace-pre-wrap">{m.texto}</p>
                        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", m.autor === "agente" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          <span>{brTime(m.em)}</span>
                          {m.autor === "agente" && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t bg-background flex items-center gap-2">
                <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviar()}
                  placeholder="Digite uma mensagem..."
                />
                <Button onClick={enviar} disabled={!texto.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecione uma conversa</div>
          )}
        </div>

        {/* Detalhes do contato */}
        <div className="col-span-12 md:col-span-3 border-l flex flex-col">
          {ativa && (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg">{iniciais(ativa.contatoNome)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold">{ativa.contatoNome}</p>
                    <p className="text-xs text-muted-foreground">{ativa.contatoEmpresa}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {ativa.telefone}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Vínculo no CRM</p>
                  {leadVinculado ? (
                    <div className="rounded-md border p-2 text-sm">
                      <p className="font-medium">{leadVinculado.cliente}</p>
                      <p className="text-xs text-muted-foreground">Etapa: {leadVinculado.etapa}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem lead vinculado.</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button className="w-full" onClick={criarOportunidade}><UserPlus className="h-4 w-4" /> Criar Oportunidade no Funil</Button>
                  <Button variant="outline" className="w-full" onClick={salvarHistorico}><Save className="h-4 w-4" /> Salvar Histórico no CRM</Button>
                </div>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">Cliente</Badge>
                    <Badge variant="secondary">WhatsApp</Badge>
                    <Badge variant="secondary">SP</Badge>
                  </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">Última atividade: {brDate(ativa.mensagens[ativa.mensagens.length - 1]?.em ?? new Date())}</p>
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}