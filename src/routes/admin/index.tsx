import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — VendaPro CRM" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard da Plataforma</h1>
        <p className="text-sm text-muted-foreground">
          Olá, {session?.user.nome}. Gestão global de tenants (Fase 5 expandirá este portal).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Tenants
            </CardTitle>
            <CardDescription>Empresas cadastradas na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1</p>
            <p className="text-xs text-muted-foreground">mock: demo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Usuários
            </CardTitle>
            <CardDescription>Contas ativas (mock)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Billing
            </CardTitle>
            <CardDescription>Placeholder Fase 5</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
