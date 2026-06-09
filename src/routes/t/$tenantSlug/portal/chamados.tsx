import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Headphones, Plus } from "lucide-react";
import { toast } from "sonner";

import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { filterChamadosForClient } from "@/lib/client-portal/selectors";
import { useClientScope } from "@/lib/client-portal/use-client-scope";
import { useCrm } from "@/lib/crm-store";
import { brDateTime } from "@/lib/format";

export const Route = createFileRoute("/t/$tenantSlug/portal/chamados")({
  head: () => ({ meta: [{ title: "Chamados — Portal do Cliente" }] }),
  component: PortalChamados,
});

function PortalChamados() {
  const scope = useClientScope();
  const { chamados, adicionarChamado } = useCrm();
  const meus = filterChamadosForClient(chamados, scope);

  const [open, setOpen] = React.useState(false);
  const [titulo, setTitulo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");

  const abrirChamado = () => {
    if (!titulo.trim()) return toast.error("Informe o título do chamado.");
    if (!descricao.trim()) return toast.error("Descreva o problema ou solicitação.");

    adicionarChamado({
      tenantId: scope.tenantId,
      clientId: scope.clientId,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
    });

    setTitulo("");
    setDescricao("");
    setOpen(false);
    toast.success("Chamado aberto com sucesso!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chamados de Suporte</h1>
          <p className="text-sm text-muted-foreground">
            Abra chamados e acompanhe o atendimento da equipe.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Abrir chamado
        </Button>
      </div>

      {meus.length === 0 ? (
        <PortalEmptyState
          icon={Headphones}
          title="Nenhum chamado registrado"
          description="Use o botão acima para abrir seu primeiro chamado de suporte."
        />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{meus.length} chamado(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aberto em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meus.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{c.titulo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.descricao}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PortalStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {brDateTime(c.criadoEm)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo chamado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="chamado-titulo">Título</Label>
              <Input
                id="chamado-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Dúvida sobre contrato"
              />
            </div>
            <div>
              <Label htmlFor="chamado-descricao">Descrição</Label>
              <Textarea
                id="chamado-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva sua solicitação com detalhes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirChamado}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
