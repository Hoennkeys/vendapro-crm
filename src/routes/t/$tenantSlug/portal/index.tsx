import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, FolderKanban, Headphones, Receipt } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  filterChamadosForClient,
  filterFaturasForClient,
  filterProjetosForClient,
  filterPropostasForClient,
} from "@/lib/client-portal/selectors";
import { useClientScope } from "@/lib/client-portal/use-client-scope";
import { useAuth } from "@/lib/auth/auth-store";
import { useCrm } from "@/lib/crm-store";
import { useTenant } from "@/lib/tenant/tenant-store";

export const Route = createFileRoute("/t/$tenantSlug/portal/")({
  head: () => ({ meta: [{ title: "Portal do Cliente — VendaPro CRM" }] }),
  component: PortalHome,
});

const modules = [
  {
    title: "Propostas",
    desc: "Suas propostas comerciais",
    icon: FileText,
    to: "/t/$tenantSlug/portal/propostas" as const,
    countKey: "propostas" as const,
  },
  {
    title: "Projetos",
    desc: "Status dos seus projetos",
    icon: FolderKanban,
    to: "/t/$tenantSlug/portal/projetos" as const,
    countKey: "projetos" as const,
  },
  {
    title: "Chamados",
    desc: "Suporte e atendimento",
    icon: Headphones,
    to: "/t/$tenantSlug/portal/chamados" as const,
    countKey: "chamados" as const,
  },
  {
    title: "Faturamento",
    desc: "Faturas e pagamentos",
    icon: Receipt,
    to: "/t/$tenantSlug/portal/faturamento" as const,
    countKey: "faturas" as const,
  },
];

function PortalHome() {
  const { tenantSlug } = Route.useParams();
  const { session } = useAuth();
  const { whiteLabel } = useTenant();
  const scope = useClientScope();
  const { propostas, chamados, faturas, pipelineItems } = useCrm();

  const counts = {
    propostas: filterPropostasForClient(propostas, scope).length,
    projetos: filterProjetosForClient(pipelineItems, scope).length,
    chamados: filterChamadosForClient(chamados, scope).length,
    faturas: filterFaturasForClient(faturas, scope).length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Portal do Cliente
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Bem-vindo, {session?.user.nome}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse propostas, projetos, chamados e faturamento vinculados à sua conta em{" "}
          <strong>{whiteLabel.nome}</strong>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link key={mod.title} to={mod.to} params={{ tenantSlug }} className="group block">
            <Card className="transition-colors hover:border-primary/40 hover:bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <mod.icon className="h-4 w-4 text-primary" />
                    {mod.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{mod.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{counts[mod.countKey]} registro(s)</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
