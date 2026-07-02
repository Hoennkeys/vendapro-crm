import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getMockTenant } from "@/lib/tenant/mock-tenants";
import { Plus, Phone, Mail, MessageSquare, StickyNote, ChevronLeft, FileText } from "lucide-react";
import { PipelineBoard } from "@/components/pipelines/pipeline-board";
import { PropostaGenerator } from "@/components/propostas/proposta-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leadsToPipelineItems } from "@/lib/pipelines/adapter";
import { getPipelineById, SALES_PIPELINE_ID } from "@/lib/pipelines/defaults";
import type { PipelineItem } from "@/lib/pipelines/types";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brl, brDate } from "@/lib/format";
import { etapas } from "@/lib/mock-data";
import { useTenant } from "@/lib/tenant/tenant-store";
import type { Etapa, Lead, Prioridade, Usuario } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CREATOR_TERMS,
  creatorPageTitle,
  labelPipelineDescription,
  labelPipelineDisplay,
} from "@/modules/creator/domain/terminology";
import { toast } from "sonner";

export const Route = createFileRoute("/t/$tenantSlug/app/funil/$pipelineId")({
  beforeLoad: ({ params }) => {
    const tenant = getMockTenant(params.tenantSlug);
    if (!tenant) throw notFound();
    const pipeline = getPipelineById(tenant.id, params.pipelineId);
    if (!pipeline) throw notFound();
    return { pipeline };
  },
  head: ({ params }) => {
    const tenant = getMockTenant(params.tenantSlug);
    const pipeline = tenant ? getPipelineById(tenant.id, params.pipelineId) : undefined;
    return {
      meta: [
        {
          title: creatorPageTitle(
            labelPipelineDisplay(params.pipelineId, pipeline?.nome ?? "Pipeline"),
          ),
        },
      ],
    };
  },
  component: PipelinePage,
});

const corEtapa: Record<Etapa, string> = {
  "Sem Contato": "bg-slate-500",
  "Em Atendimento": "bg-indigo-500",
  "Proposta Enviada": "bg-amber-500",
  Ganho: "bg-emerald-600",
  Perdido: "bg-red-600",
};

const corPrioridade: Record<Prioridade, string> = {
  Alta: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Média: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Baixa: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function PipelinePage() {
  const { tenantSlug, pipelineId } = Route.useParams();
  const { pipeline: pipelineFromContext } = Route.useRouteContext();
  const { whiteLabel } = useTenant();
  const pipeline = pipelineFromContext ?? getPipelineById(whiteLabel.tenantId, pipelineId)!;
  const { leads, pipelineItems, usuarios, moverPipelineItem, adicionarLead } = useCrm();

  const isSales = pipeline.id === SALES_PIPELINE_ID;
  const items = isSales
    ? leadsToPipelineItems(leads, pipeline.id)
    : pipelineItems.filter((item) => item.pipelineId === pipeline.id);

  const [selecionado, setSelecionado] = React.useState<PipelineItem | null>(null);
  const [novoOpen, setNovoOpen] = React.useState(false);

  const leadSelecionado =
    selecionado && isSales ? (leads.find((l) => l.id === selecionado.id) ?? null) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 h-8" asChild>
            <Link to="/t/$tenantSlug/app/funil" params={{ tenantSlug }}>
              <ChevronLeft className="h-4 w-4" />
              Pipelines
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {labelPipelineDisplay(pipeline.id, pipeline.nome)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {labelPipelineDescription(pipeline.id, pipeline.descricao ?? "Arraste os cards entre as etapas.")}
          </p>
        </div>
        {isSales && (
          <Button onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4" /> Nova {CREATOR_TERMS.lead}
          </Button>
        )}
      </div>

      {isSales ? (
        <PipelineBoard
          pipeline={pipeline}
          items={items}
          onMoveItem={(itemId, stageId) => moverPipelineItem(pipeline.id, itemId, stageId)}
          onItemClick={setSelecionado}
          getStageTotal={(_, stageItems) =>
            stageItems.reduce((acc, item) => acc + Number(item.dados.valor ?? 0), 0)
          }
        />
      ) : (
        <PipelineBoard
          pipeline={pipeline}
          items={items}
          onMoveItem={(itemId, stageId) => moverPipelineItem(pipeline.id, itemId, stageId)}
          onItemClick={setSelecionado}
        />
      )}

      {isSales && (
        <>
          <DialogLead
            lead={leadSelecionado}
            usuarios={usuarios}
            onClose={() => setSelecionado(null)}
          />
          <NovoLeadDialog
            open={novoOpen}
            onOpenChange={setNovoOpen}
            usuarios={usuarios}
            onCriar={(novo) => {
              adicionarLead(novo);
              setNovoOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

function NovoLeadDialog({
  open,
  onOpenChange,
  usuarios,
  onCriar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  usuarios: Usuario[];
  onCriar: (l: Omit<Lead, "id" | "criadoEm" | "timeline">) => void;
}) {
  const emptyForm = React.useCallback(
    () => ({
      cliente: "",
      contato: "",
      email: "",
      telefone: "",
      valor: 0,
      etapa: "Sem Contato" as Etapa,
      prioridade: "Média" as Prioridade,
      responsavelId: usuarios[0]?.id ?? "",
    }),
    [usuarios],
  );

  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open, emptyForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova {CREATOR_TERMS.lead}</DialogTitle>
          <DialogDescription>
            Adicione uma nova oportunidade ao {CREATOR_TERMS.funnel.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>{CREATOR_TERMS.client} / {CREATOR_TERMS.company}</Label>
            <Input
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            />
          </div>
          <div>
            <Label>Contato</Label>
            <Input
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>E-mail</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
            />
          </div>
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
            <Label>Etapa</Label>
            <Select
              value={form.etapa}
              onValueChange={(v) => setForm({ ...form, etapa: v as Etapa })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {etapas.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{CREATOR_TERMS.employee}</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onCriar(form)} disabled={!form.cliente}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogLead({
  lead,
  usuarios,
  onClose,
}: {
  lead: Lead | null;
  usuarios: Usuario[];
  onClose: () => void;
}) {
  const { adicionarTimeline } = useCrm();
  const [tab, setTab] = React.useState<"detalhes" | "proposta">("detalhes");

  React.useEffect(() => {
    setTab("detalhes");
  }, [lead?.id]);

  if (!lead) return null;

  const icone = (t: string) =>
    t === "ligacao" ? (
      <Phone className="h-3 w-3" />
    ) : t === "email" ? (
      <Mail className="h-3 w-3" />
    ) : t === "mensagem" ? (
      <MessageSquare className="h-3 w-3" />
    ) : (
      <StickyNote className="h-3 w-3" />
    );

  const handlePropostaCreated = (proposta: { id: string; numero: string }) => {
    adicionarTimeline(lead.id, {
      tipo: "anotacao",
      em: new Date().toISOString(),
      texto: `Proposta ${proposta.numero} criada e vinculada a esta ${CREATOR_TERMS.lead.toLowerCase()}.`,
    });
    toast.success(`Proposta registrada na ${CREATOR_TERMS.lead.toLowerCase()}`, {
      description: `${proposta.numero} adicionada à linha do tempo.`,
    });
    setTab("detalhes");
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          "max-w-2xl",
          tab === "proposta" && "max-w-4xl max-h-[90vh] overflow-y-auto",
        )}
      >
        <DialogHeader>
          <DialogTitle>{lead.cliente}</DialogTitle>
          <DialogDescription>
            {lead.contato} · {lead.email} · {lead.telefone}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "detalhes" | "proposta")}>
          <TabsList className="w-full">
            <TabsTrigger value="detalhes" className="flex-1">
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="proposta" className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              Gerar Proposta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Valor">{brl(lead.valor)}</Info>
              <Info label="Etapa">
                <Badge className={cn(corEtapa[lead.etapa], "text-white")}>{lead.etapa}</Badge>
              </Info>
              <Info label="Prioridade">
                <Badge variant="secondary" className={corPrioridade[lead.prioridade]}>
                  {lead.prioridade}
                </Badge>
              </Info>
              <Info label={CREATOR_TERMS.employee}>{nomeVendedor(usuarios, lead.responsavelId)}</Info>
              <Info label="Criado em">{brDate(lead.criadoEm)}</Info>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Linha do tempo</h3>
              {lead.timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
              )}
              <ul className="space-y-2">
                {lead.timeline.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                    <span className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                      {icone(t.tipo)}
                    </span>
                    <div className="flex-1">
                      <p>{t.texto}</p>
                      <p className="text-xs text-muted-foreground">
                        {brDate(t.em)} · {t.tipo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="proposta" className="mt-4">
            <PropostaGenerator
              embedded
              leadId={lead.id}
              onCreated={handlePropostaCreated}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
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
