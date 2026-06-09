import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalStatusBadge } from "@/components/portal/portal-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { filterFaturasForClient } from "@/lib/client-portal/selectors";
import { useClientScope } from "@/lib/client-portal/use-client-scope";
import { useCrm } from "@/lib/crm-store";
import { brl, brDate } from "@/lib/format";

export const Route = createFileRoute("/t/$tenantSlug/portal/faturamento")({
  head: () => ({ meta: [{ title: "Faturamento — Portal do Cliente" }] }),
  component: PortalFaturamento,
});

function PortalFaturamento() {
  const scope = useClientScope();
  const { faturas } = useCrm();
  const minhas = filterFaturasForClient(faturas, scope);

  const totalPendente = minhas
    .filter((f) => f.status === "Pendente" || f.status === "Vencida")
    .reduce((acc, f) => acc + f.valor, 0);

  const totalPago = minhas.filter((f) => f.status === "Paga").reduce((acc, f) => acc + f.valor, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Faturamento</h1>
        <p className="text-sm text-muted-foreground">
          Consulte suas faturas, vencimentos e histórico de pagamentos.
        </p>
      </div>

      {minhas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em aberto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{brl(totalPendente)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {brl(totalPago)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {minhas.length === 0 ? (
        <PortalEmptyState
          icon={Receipt}
          title="Nenhuma fatura encontrada"
          description="Suas faturas emitidas aparecerão aqui com status e vencimento."
        />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{minhas.length} fatura(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {minhas.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.numero}</TableCell>
                    <TableCell>{f.descricao}</TableCell>
                    <TableCell>{brl(f.valor)}</TableCell>
                    <TableCell>{brDate(f.vencimento)}</TableCell>
                    <TableCell>
                      <PortalStatusBadge status={f.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
