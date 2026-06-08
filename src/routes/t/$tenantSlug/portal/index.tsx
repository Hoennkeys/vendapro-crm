import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderKanban, Headphones, Receipt } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-store";
import { getMockTenant } from "@/lib/tenant/mock-tenants";

export const Route = createFileRoute("/t/$tenantSlug/portal/")({
  head: () => ({ meta: [{ title: "Portal do Cliente — VendaPro CRM" }] }),
  component: PortalHome,
});

function PortalHome() {
  const { tenantSlug } = Route.useParams();
  const { session } = useAuth();
  const tenant = getMockTenant(tenantSlug);

  const modules = [
    { title: "Propostas", desc: "Suas propostas comerciais", icon: FileText },
    { title: "Projetos", desc: "Status dos seus projetos", icon: FolderKanban },
    { title: "Chamados", desc: "Suporte e atendimento", icon: Headphones },
    { title: "Faturamento", desc: "Faturas e pagamentos", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo, {session?.user.nome}</h1>
        <p className="text-sm text-muted-foreground">
          Portal do cliente — {tenant?.nome ?? tenantSlug}. Telas completas na Fase 6.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Card key={mod.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <mod.icon className="h-4 w-4" />
                {mod.title}
              </CardTitle>
              <CardDescription>{mod.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Em breve (Fase 6)</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
