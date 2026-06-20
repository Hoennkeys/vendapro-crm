import { createFileRoute } from "@tanstack/react-router";
import { PropostaGenerator } from "@/components/propostas/proposta-generator";

export const Route = createFileRoute("/t/$tenantSlug/app/propostas")({
  head: () => ({ meta: [{ title: "Gerador de Propostas — VendaPro CRM" }] }),
  component: PropostasPage,
});

function PropostasPage() {
  return <PropostaGenerator />;
}
