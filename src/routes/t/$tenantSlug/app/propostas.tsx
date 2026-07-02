import { createFileRoute } from "@tanstack/react-router";
import { PropostaGenerator } from "@/components/propostas/proposta-generator";
import { pageTitle } from "@/lib/product-branding";
import { CREATOR_TERMS } from "@/modules/creator/domain/terminology";

export const Route = createFileRoute("/t/$tenantSlug/app/propostas")({
  head: () => ({ meta: [{ title: pageTitle(`Gerador de ${CREATOR_TERMS.proposal}s`) }] }),
  component: PropostasPage,
});

function PropostasPage() {
  return <PropostaGenerator />;
}
