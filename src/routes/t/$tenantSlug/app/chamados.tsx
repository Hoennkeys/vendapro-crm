import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones, MessageSquare } from "lucide-react";

import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clientDisplayName } from "@/lib/clients-registry";
import { useCrm } from "@/lib/crm-store";
import { brDateTime } from "@/lib/format";
import { useTenant } from "@/lib/tenant/tenant-store";

export const Route = createFileRoute("/t/$tenantSlug/app/chamados")({
  head: () => ({ meta: [{ title: "Chamados — VendaPro CRM" }] }),
  component: AppChamados,
});

function AppChamados() {
  const { tenantSlug } = Route.useParams();
  const { whiteLabel } = useTenant();
  const { chamados } = useCrm();

  const doTenant = chamados
    .filter((c) => c.tenantId === whiteLabel.tenantId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const abertos = doTenant.filter((c) => c.status === "Aberto" || c.status === "Em andamento");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chamados de Suporte</h1>
          <p className="text-sm text-muted-foreground">
            Tickets abertos pelos clientes no portal — correlacionados a leads e faturas.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/t/$tenantSlug/portal/chamados" params={{ tenantSlug }}>
            Ver portal do cliente
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doTenant.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{abertos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {doTenant.filter((c) => c.status === "Resolvido" || c.status === "Fechado").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Headphones className="h-4 w-4" />
            Todos os chamados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {doTenant.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum chamado registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aberto em</TableHead>
                  <TableHead className="w-[160px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doTenant.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium">{c.titulo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.descricao}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{clientDisplayName(c.clientId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <PortalStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{brDateTime(c.criadoEm)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to="/t/$tenantSlug/app/communications/inbox"
                          params={{ tenantSlug }}
                          search={{
                            chamadoId: c.id,
                            clientId: c.clientId,
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Atender Cliente
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
