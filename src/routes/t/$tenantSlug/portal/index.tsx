import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderKanban, Headphones, Receipt } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-store";
import { useTenant } from "@/lib/tenant/tenant-store";

export const Route = createFileRoute("/t/$tenantSlug/portal/")({
  head: () => ({ meta: [{ title: "Portal do Cliente — VendaPro CRM" }] }),
  component: PortalHome,
});

function PortalHome() {
  const { session } = useAuth();
  const { whiteLabel } = useTenant();

  const modules = [
    { title: "Propostas", desc: "Suas propostas comerciais", icon: FileText },
    { title: "Projetos", desc: "Status dos seus projetos", icon: FolderKanban },
    { title: "Chamados", desc: "Suporte e atendimento", icon: Headphones },
    { title: "Faturamento", desc: "Faturas e pagamentos", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          White label ativo
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Bem-vindo, {session?.user.nome}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Você está no portal de <strong>{whiteLabel.nome}</strong>. As cores e logo vêm da
          configuração white label do tenant (Fase 6 trará as telas completas).
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="inline-block h-3 w-3 rounded-full border"
            style={{ background: whiteLabel.cores.primary }}
          />
          Tema: {whiteLabel.cores.primary}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Card key={mod.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <mod.icon className="h-4 w-4 text-primary" />
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
