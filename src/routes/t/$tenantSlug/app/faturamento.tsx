import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

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
import { brDate, brl } from "@/lib/format";
import { useTenant } from "@/lib/tenant/tenant-store";
import { CREATOR_TERMS, creatorPageTitle, NAV_LABELS } from "@/modules/creator/domain/terminology";

export const Route = createFileRoute("/t/$tenantSlug/app/faturamento")({
  head: () => ({ meta: [{ title: creatorPageTitle(NAV_LABELS.faturamento) }] }),
  component: AppFaturamento,
});

function AppFaturamento() {
  const { tenantSlug } = Route.useParams();
  const { whiteLabel } = useTenant();
  const { faturas, propostas } = useCrm();

  const doTenant = faturas
    .filter((f) => f.tenantId === whiteLabel.tenantId)
    .sort((a, b) => new Date(b.vencimento).getTime() - new Date(a.vencimento).getTime());

  const pendente = doTenant
    .filter((f) => f.status === "Pendente" || f.status === "Vencida")
    .reduce((acc, f) => acc + f.valor, 0);

  const pago = doTenant.filter((f) => f.status === "Paga").reduce((acc, f) => acc + f.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{NAV_LABELS.faturamento}</h1>
          <p className="text-sm text-muted-foreground">
            Faturas emitidas com base em propostas aceitas — visível também no portal.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/t/$tenantSlug/portal/faturamento" params={{ tenantSlug }}>
            Ver {CREATOR_TERMS.portal.toLowerCase()}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{brl(pendente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{brl(pago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Propostas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {propostas.filter((p) => p.tenantId === whiteLabel.tenantId && p.status === "Pendente").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Faturas emitidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {doTenant.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fatura registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>{CREATOR_TERMS.client}</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doTenant.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-sm">{f.numero}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{clientDisplayName(f.clientId)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{f.descricao}</TableCell>
                    <TableCell>{brDate(f.vencimento)}</TableCell>
                    <TableCell>
                      <PortalStatusBadge status={f.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{brl(f.valor)}</TableCell>
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
