import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CreditCard, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatform } from "@/lib/admin/platform-store";
import { useAuth } from "@/lib/auth/auth-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — VendaPro CRM" }] }),
  component: AdminDashboard,
});

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AdminDashboard() {
  const { session } = useAuth();
  const { tenants, metrics } = usePlatform();

  const recentTenants = [...tenants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard da Plataforma</h1>
          <p className="text-sm text-muted-foreground">
            Olá, {session?.user.nome}. Visão macro de tenants e receita.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/tenants">Gerenciar tenants</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Tenants
            </CardTitle>
            <CardDescription>Total na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalTenants}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.activeTenants} ativos · {metrics.trialTenants} trial ·{" "}
              {metrics.suspendedTenants} suspensos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Usuários
            </CardTitle>
            <CardDescription>Contas mock cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              MRR
            </CardTitle>
            <CardDescription>Receita recorrente estimada</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(metrics.mrrEstimate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Billing
            </CardTitle>
            <CardDescription>Faturamento da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link to="/admin/billing">Ver detalhes →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenants recentes</CardTitle>
          <CardDescription>Últimos cadastros na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recentTenants.map((tenant) => (
              <li
                key={tenant.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    to="/admin/tenants/$tenantId"
                    params={{ tenantId: tenant.id }}
                    className="font-medium hover:underline"
                  >
                    {tenant.nome}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    <code>/t/{tenant.slug}</code> · {tenant.plan}
                  </p>
                </div>
                <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                  {tenant.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
