import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, CalendarIcon, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brDate, isoFromDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prioridade, Tarefa } from "@/lib/types";

export const Route = createFileRoute("/t/$tenantSlug/app/agenda")({
  head: () => ({ meta: [{ title: "Agenda e Tarefas — VendaPro CRM" }] }),
  component: Agenda,
});

const corPrioridade: Record<Prioridade, string> = {
  Alta: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Média: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Baixa: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function Agenda() {
  const { tarefas, usuarios, toggleTarefa, adicionarTarefa } = useCrm();
  const [novo, setNovo] = React.useState(false);
  const [form, setForm] = React.useState({
    titulo: "",
    responsavelId: usuarios[0]?.id ?? "",
    prioridade: "Média" as Prioridade,
    prazo: new Date().toISOString(),
    concluida: false,
  });

  const pendentes = tarefas.filter((t) => !t.concluida);
  const concluidas = tarefas.filter((t) => t.concluida);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda e Tarefas</h1>
          <p className="text-sm text-muted-foreground">Organize seu dia e acompanhe a equipe.</p>
        </div>
        <Button onClick={() => setNovo(true)}>
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      <Tabs defaultValue="tarefas">
        <TabsList>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="tarefas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendentes ({pendentes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendentes.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem tarefas pendentes 🎉</p>
              )}
              {pendentes.map((t) => (
                <ItemTarefa
                  key={t.id}
                  t={t}
                  onToggle={() => toggleTarefa(t.id)}
                  responsavel={nomeVendedor(usuarios, t.responsavelId)}
                />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Concluídas ({concluidas.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {concluidas.map((t) => (
                <ItemTarefa
                  key={t.id}
                  t={t}
                  onToggle={() => toggleTarefa(t.id)}
                  responsavel={nomeVendedor(usuarios, t.responsavelId)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario">
          <Calendario tarefas={tarefas} />
        </TabsContent>
      </Tabs>

      <Dialog open={novo} onOpenChange={setNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma atividade ao seu dia.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex.: Ligar para cliente Marcos Silva"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={form.prioridade}
                  onValueChange={(v) => setForm({ ...form, prioridade: v as Prioridade })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Alta", "Média", "Baixa"] as Prioridade[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Select
                  value={form.responsavelId}
                  onValueChange={(v) => setForm({ ...form, responsavelId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.prazo.slice(0, 10)}
                onChange={(e) => setForm({ ...form, prazo: isoFromDateInput(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovo(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                adicionarTarefa(form);
                setNovo(false);
                setForm({ ...form, titulo: "" });
              }}
              disabled={!form.titulo}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemTarefa({
  t,
  onToggle,
  responsavel,
}: {
  t: Tarefa;
  onToggle: () => void;
  responsavel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent/30 transition-colors">
      <Checkbox checked={t.concluida} onCheckedChange={onToggle} />
      <div className="flex-1">
        <p className={cn("text-sm", t.concluida && "line-through text-muted-foreground")}>
          {t.titulo}
        </p>
        <p className="text-xs text-muted-foreground">
          {responsavel} · Prazo: {brDate(t.prazo)}
        </p>
      </div>
      <Badge variant="secondary" className={corPrioridade[t.prioridade as Prioridade]}>
        {t.prioridade}
      </Badge>
      {t.concluida ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

function Calendario({ tarefas }: { tarefas: Tarefa[] }) {
  const [mes] = React.useState(new Date());
  const ano = mes.getFullYear();
  const m = mes.getMonth();
  const primeiro = new Date(ano, m, 1);
  const ultimoDia = new Date(ano, m + 1, 0).getDate();
  const offset = primeiro.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= ultimoDia; i++) cells.push(i);

  const tarefasPorDia: Record<number, Tarefa[]> = {};
  tarefas.forEach((t) => {
    const d = new Date(t.prazo);
    if (d.getMonth() === m && d.getFullYear() === ano) {
      const dia = d.getDate();
      (tarefasPorDia[dia] ||= []).push(t);
    }
  });

  const nomeMes = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const hoje = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 capitalize">
          <CalendarIcon className="h-4 w-4" /> {nomeMes}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground mb-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => (
            <div
              key={i}
              className={cn(
                "min-h-20 rounded border p-1 text-xs",
                c === null && "bg-muted/30 border-transparent",
                c === hoje.getDate() &&
                  hoje.getMonth() === m &&
                  hoje.getFullYear() === ano &&
                  "bg-primary/10 border-primary",
              )}
            >
              {c && <div className="font-medium mb-1">{c}</div>}
              {c &&
                (tarefasPorDia[c] ?? []).slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="truncate rounded bg-primary/15 text-primary px-1 py-0.5 mb-0.5"
                  >
                    {t.titulo}
                  </div>
                ))}
              {c && (tarefasPorDia[c]?.length ?? 0) > 2 && (
                <div className="text-[10px] text-muted-foreground">
                  +{tarefasPorDia[c].length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
