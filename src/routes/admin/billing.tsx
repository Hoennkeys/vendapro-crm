import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, FileText, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatform } from "@/lib/admin/platform-store";
import type { TenantPlan } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({ meta: [{ title: "Billing — Admin VendaPro" }] }),
  component: BillingPage,
});

const PLAN_LABELS: Record<TenantPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_PRICES: Record<TenantPlan, number> = {
  starter: 99,
  pro: 299,
  enterprise: 799,
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BillingPage() {
  const { tenants, metrics } = usePlatform();

  const billableTenants = tenants.filter((t) => t.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Visão macro de receita recorrente (mock). Integração com gateway na Fase 7.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              MRR estimado
            </CardTitle>
            <CardDescription>Receita mensal recorrente (tenants ativos)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(metrics.mrrEstimate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Tenants faturáveis
            </CardTitle>
            <CardDescription>Status &quot;ativo&quot; com plano vigente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{billableTenants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Faturas
            </CardTitle>
            <CardDescription>Placeholder — emissão automática futura</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Em breve</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita por tenant</CardTitle>
          <CardDescription>Valores mock com base no plano de cada tenant ativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor mensal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Link
                      to="/admin/tenants/$tenantId"
                      params={{ tenantId: tenant.id }}
                      className="font-medium hover:underline"
                    >
                      {tenant.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{PLAN_LABELS[tenant.plan]}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {tenant.status === "active" ? formatCurrency(PLAN_PRICES[tenant.plan]) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Gateway de pagamento</p>
            <p className="text-sm text-muted-foreground">
              Stripe / Asaas / PagSeguro será integrado na Fase 7 com faturas reais e webhooks.
            </p>
          </div>
          <Button variant="outline" disabled>
            Conectar gateway
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
