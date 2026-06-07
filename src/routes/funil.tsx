import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Phone, Mail, MessageSquare, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brl, brDate } from "@/lib/format";
import { etapas } from "@/lib/mock-data";
import type { Etapa, Lead, Prioridade } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/funil")({
  head: () => ({ meta: [{ title: "Funil de Vendas — VendaPro CRM" }] }),
  component: Funil,
});

const corEtapa: Record<Etapa, string> = {
  "Sem Contato": "bg-slate-500",
  "Em Atendimento": "bg-indigo-500",
  "Proposta Enviada": "bg-amber-500",
  "Ganho": "bg-emerald-600",
  "Perdido": "bg-red-600",
};

const corPrioridade: Record<Prioridade, string> = {
  Alta: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Média: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Baixa: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function Funil() {
  const { leads, usuarios, moverLead, adicionarLead } = useCrm();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [selecionado, setSelecionado] = React.useState<Lead | null>(null);
  const [novoOpen, setNovoOpen] = React.useState(false);
  const suppressClickRef = React.useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleEnd = (e: DragEndEvent) => {
    const id = e.active.id as string;
    const overId = e.over?.id as string | undefined;
    setActiveId(null);
    if (!overId) return;
    if (etapas.includes(overId as Etapa)) {
      suppressClickRef.current = true;
      moverLead(id, overId as Etapa);
    }
  };

  const ativo = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funil de Vendas</h1>
          <p className="text-sm text-muted-foreground">Arraste os cards entre as etapas.</p>
        </div>
        <Button onClick={() => setNovoOpen(true)}><Plus className="h-4 w-4" /> Novo Lead</Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
        onDragEnd={handleEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {etapas.map((etapa) => {
            const items = leads.filter((l) => l.etapa === etapa);
            const total = items.reduce((a, l) => a + l.valor, 0);
            return (
              <Coluna key={etapa} etapa={etapa} total={total} qtd={items.length}>
                {items.map((l) => (
                  <CardLead
                    key={l.id}
                    lead={l}
                    suppressClickRef={suppressClickRef}
                    onClick={() => setSelecionado(l)}
                  />
                ))}
              </Coluna>
            );
          })}
        </div>
        <DragOverlay>
          {ativo ? <div className="opacity-90"><CardLead lead={ativo} onClick={() => {}} /></div> : null}
        </DragOverlay>
      </DndContext>

      <DialogLead lead={selecionado} onClose={() => setSelecionado(null)} />
      <NovoLeadDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        onCriar={(novo) => {
          adicionarLead(novo);
          setNovoOpen(false);
        }}
      />
    </div>
  );

  function NovoLeadDialog({
    open, onOpenChange, onCriar,
  }: { open: boolean; onOpenChange: (v: boolean) => void; onCriar: (l: any) => void }) {
    const [form, setForm] = React.useState({
      cliente: "", contato: "", email: "", telefone: "", valor: 0,
      etapa: "Sem Contato" as Etapa, prioridade: "Média" as Prioridade,
      responsavelId: usuarios[0]?.id ?? "",
    });
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Adicione uma nova oportunidade ao funil.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Cliente / Empresa</Label><Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
            <div><Label>Contato</Label><Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} /></div>
            <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
            <div className="col-span-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} /></div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v as Prioridade })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Alta", "Média", "Baixa"] as Prioridade[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Etapa</Label>
              <Select value={form.etapa} onValueChange={(v) => setForm({ ...form, etapa: v as Etapa })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{etapas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável</Label>
              <Select value={form.responsavelId} onValueChange={(v) => setForm({ ...form, responsavelId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{usuarios.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={() => onCriar(form)} disabled={!form.cliente}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function DialogLead({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
    if (!lead) return null;
    const icone = (t: string) =>
      t === "ligacao" ? <Phone className="h-3 w-3" /> :
      t === "email" ? <Mail className="h-3 w-3" /> :
      t === "mensagem" ? <MessageSquare className="h-3 w-3" /> :
      <StickyNote className="h-3 w-3" />;
    return (
      <Dialog open onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{lead.cliente}</DialogTitle>
            <DialogDescription>{lead.contato} · {lead.email} · {lead.telefone}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Valor">{brl(lead.valor)}</Info>
            <Info label="Etapa"><Badge className={cn(corEtapa[lead.etapa], "text-white")}>{lead.etapa}</Badge></Info>
            <Info label="Prioridade"><Badge variant="secondary" className={corPrioridade[lead.prioridade]}>{lead.prioridade}</Badge></Info>
            <Info label="Responsável">{nomeVendedor(usuarios, lead.responsavelId)}</Info>
            <Info label="Criado em">{brDate(lead.criadoEm)}</Info>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Linha do tempo</h3>
            {lead.timeline.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>}
            <ul className="space-y-2">
              {lead.timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                  <span className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">{icone(t.tipo)}</span>
                  <div className="flex-1">
                    <p>{t.texto}</p>
                    <p className="text-xs text-muted-foreground">{brDate(t.em)} · {t.tipo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

function Coluna({ etapa, total, qtd, children }: { etapa: Etapa; total: number; qtd: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  return (
    <div
      ref={setNodeRef}
      className={cn("flex flex-col rounded-lg border bg-muted/30 p-3 transition-colors", isOver && "bg-accent/50 ring-2 ring-primary")}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", corEtapa[etapa])} />
          <span className="text-sm font-semibold">{etapa}</span>
          <Badge variant="secondary" className="text-xs">{qtd}</Badge>
        </div>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{brl(total)}</p>
      <div className="flex flex-col gap-2 min-h-[120px]">{children}</div>
    </div>
  );
}

function CardLead({
  lead,
  onClick,
  suppressClickRef,
}: {
  lead: Lead;
  onClick: () => void;
  suppressClickRef?: React.MutableRefObject<boolean>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const handleClick = () => {
    if (suppressClickRef?.current) {
      suppressClickRef.current = false;
      return;
    }
    onClick();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn("cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md", isDragging && "opacity-30")}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{lead.cliente}</p>
          <Badge variant="secondary" className={cn("text-[10px]", corPrioridade[lead.prioridade])}>{lead.prioridade}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{lead.contato}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">{brl(lead.valor)}</span>
          <span className="text-[11px] text-muted-foreground">{brDate(lead.criadoEm)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  );
}