import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

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
import { filterPropostasForClient } from "@/lib/client-portal/selectors";
import { useClientScope } from "@/lib/client-portal/use-client-scope";
import { useCrm } from "@/lib/crm-store";
import { brl, brDate } from "@/lib/format";

export const Route = createFileRoute("/t/$tenantSlug/portal/propostas")({
  head: () => ({ meta: [{ title: "Propostas — Portal do Cliente" }] }),
  component: PortalPropostas,
});

function PortalPropostas() {
  const scope = useClientScope();
  const { propostas } = useCrm();
  const minhas = filterPropostasForClient(propostas, scope);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suas Propostas</h1>
        <p className="text-sm text-muted-foreground">
          Propostas comerciais vinculadas à sua conta.
        </p>
      </div>

      {minhas.length === 0 ? (
        <PortalEmptyState
          icon={FileText}
          title="Nenhuma proposta encontrada"
          description="Quando uma proposta for enviada para você, ela aparecerá aqui."
        />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{minhas.length} proposta(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {minhas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.numero}</TableCell>
                    <TableCell>{brl(p.valor)}</TableCell>
                    <TableCell>{brDate(p.validade)}</TableCell>
                    <TableCell>
                      <PortalStatusBadge status={p.status} />
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
