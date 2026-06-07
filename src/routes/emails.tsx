import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox, Send as SendIcon, FileEdit, Trash2, Pencil, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCrm } from "@/lib/crm-store";
import { brDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { aplicarTemplate, emailTemplates } from "@/lib/email-templates";
import type { EmailMsg } from "@/lib/types";

export const Route = createFileRoute("/emails")({
  head: () => ({ meta: [{ title: "Central de E-mails — VendaPro CRM" }] }),
  component: Emails,
});

const pastas = [
  { id: "Caixa de Entrada", icone: Inbox },
  { id: "Enviados", icone: SendIcon },
  { id: "Rascunhos", icone: FileEdit },
  { id: "Lixeira", icone: Trash2 },
] as const;

function Emails() {
  const { emails, enviarEmail, marcarEmailLido } = useCrm();
  const [pasta, setPasta] = React.useState<EmailMsg["pasta"]>("Caixa de Entrada");
  const [selecionado, setSelecionado] = React.useState<EmailMsg | null>(null);
  const [busca, setBusca] = React.useState("");
  const [escrever, setEscrever] = React.useState(false);

  const lista = emails
    .filter((e) => e.pasta === pasta)
    .filter((e) =>
      [e.assunto, e.de, e.para, e.corpo].some((x) => x.toLowerCase().includes(busca.toLowerCase())),
    );

  const contagens = Object.fromEntries(
    pastas.map((p) => [p.id, emails.filter((e) => e.pasta === p.id && !e.lida).length]),
  );

  React.useEffect(() => {
    setSelecionado((current) =>
      current && lista.some((e) => e.id === current.id) ? current : (lista[0] ?? null),
    );
  }, [pasta, busca, emails]);

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Central de E-mails</h1>
          <p className="text-sm text-muted-foreground">Caixa de entrada unificada da equipe.</p>
        </div>
        <Button onClick={() => setEscrever(true)}><Pencil className="h-4 w-4" /> Escrever</Button>
      </div>

      <Card className="grid grid-cols-12 h-[calc(100%-4rem)] overflow-hidden p-0">
        {/* Pastas */}
        <div className="col-span-12 md:col-span-2 border-r p-3 space-y-1">
          {pastas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPasta(p.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                pasta === p.id && "bg-accent font-medium",
              )}
            >
              <p.icone className="h-4 w-4" />
              <span className="flex-1 text-left">{p.id}</span>
              {contagens[p.id] > 0 && <Badge variant="secondary" className="text-[10px]">{contagens[p.id]}</Badge>}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="col-span-12 md:col-span-4 border-r flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar e-mails..." className="pl-8" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {lista.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum e-mail.</p>}
            {lista.map((e) => (
              <button
                key={e.id}
                onClick={() => { setSelecionado(e); if (!e.lida) marcarEmailLido(e.id); }}
                className={cn(
                  "w-full text-left p-3 border-b hover:bg-accent/50 transition-colors",
                  selecionado?.id === e.id && "bg-accent",
                  !e.lida && "font-medium",
                )}
              >
                <div className="flex justify-between gap-2">
                  <p className="text-sm truncate">{pasta === "Enviados" ? `Para: ${e.para}` : e.de}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{brDateTime(e.em)}</span>
                </div>
                <p className="text-sm truncate">{e.assunto}</p>
                <p className="text-xs text-muted-foreground truncate">{e.corpo}</p>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Leitor */}
        <div className="col-span-12 md:col-span-6 flex flex-col">
          {selecionado ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{selecionado.assunto}</h2>
                <p className="text-sm text-muted-foreground mt-1">De: {selecionado.de}</p>
                <p className="text-sm text-muted-foreground">Para: {selecionado.para}</p>
                <p className="text-xs text-muted-foreground mt-1">{brDateTime(selecionado.em)}</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 whitespace-pre-wrap text-sm">{selecionado.corpo}</div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Selecione um e-mail.</div>
          )}
        </div>
      </Card>

      <ComporDialog
        open={escrever}
        onOpenChange={setEscrever}
        onEnviar={(e) => {
          enviarEmail(e);
          toast.success("E-mail enviado!");
          setEscrever(false);
        }}
      />
    </div>
  );
}

function ComporDialog({
  open, onOpenChange, onEnviar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEnviar: (e: { de: string; para: string; assunto: string; corpo: string }) => void;
}) {
  const [para, setPara] = React.useState("");
  const [assunto, setAssunto] = React.useState("");
  const [corpo, setCorpo] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string>("");

  const aplicar = (id: string) => {
    setTemplateId(id);
    const t = emailTemplates.find((x) => x.id === id);
    if (!t) return;
    const cliente = para.split("@")[0] || "cliente";
    const { assunto: a, corpo: c } = aplicarTemplate(t, cliente, "Administrador");
    setAssunto(a);
    setCorpo(c);
  };

  React.useEffect(() => {
    if (!open) { setPara(""); setAssunto(""); setCorpo(""); setTemplateId(""); }
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
            <Label>Modelos de E-mail</Label>
            <Select value={templateId} onValueChange={aplicar}>
              <SelectTrigger><SelectValue placeholder="Selecione um modelo..." /></SelectTrigger>
              <SelectContent>
                {emailTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Para</Label><Input value={para} onChange={(e) => setPara(e.target.value)} placeholder="cliente@empresa.com.br" /></div>
          <div><Label>Assunto</Label><Input value={assunto} onChange={(e) => setAssunto(e.target.value)} /></div>
          <div><Label>Mensagem</Label><Textarea rows={10} value={corpo} onChange={(e) => setCorpo(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => onEnviar({ de: "admin@vendapro.com.br", para, assunto, corpo })}
            disabled={!para || !assunto}
          ><SendIcon className="h-4 w-4" /> Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}