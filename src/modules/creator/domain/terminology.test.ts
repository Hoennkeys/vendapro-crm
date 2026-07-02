import assert from "node:assert/strict";
import {
  CREATOR_TERMS,
  LEGACY_TERMS,
  NAV_LABELS,
  SIDEBAR_SECTIONS,
  creatorPageTitle,
  labelCrmPapel,
  labelCommunicationsRole,
  labelPipelineDisplay,
  portalPageTitle,
  resolveAppBreadcrumbs,
} from "./terminology";
import { PROJECTS_PIPELINE_ID, SALES_PIPELINE_ID } from "@/lib/pipelines/defaults";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("creator/domain/terminology — testes unitários\n");

test("CREATOR_TERMS mapeia conceitos legados", () => {
  assert.equal(CREATOR_TERMS.admin, "Creator Owner");
  assert.equal(CREATOR_TERMS.employee, "Team Member");
  assert.equal(CREATOR_TERMS.client, "Marca");
  assert.equal(CREATOR_TERMS.lead, "Oportunidade");
  assert.equal(CREATOR_TERMS.sale, "Parceria");
  assert.equal(CREATOR_TERMS.funnel, "Pipeline de campanhas");
  assert.equal(CREATOR_TERMS.portal, "Portal da Marca");
  assert.equal(CREATOR_TERMS.proposal, "Proposta de campanha");
  assert.equal(CREATOR_TERMS.company, "Creator Business");
});

test("LEGACY_TERMS preserva vocabulário CRM", () => {
  assert.equal(LEGACY_TERMS.lead, "Lead");
  assert.equal(LEGACY_TERMS.client, "Cliente");
});

test("labelCrmPapel traduz Papel sem alterar valores", () => {
  assert.equal(labelCrmPapel("Administrador"), CREATOR_TERMS.admin);
  assert.equal(labelCrmPapel("Vendedor"), CREATOR_TERMS.employee);
});

test("labelCommunicationsRole traduz roles de comms", () => {
  assert.equal(labelCommunicationsRole("admin"), CREATOR_TERMS.admin);
  assert.equal(labelCommunicationsRole("client"), CREATOR_TERMS.client);
});

test("labelPipelineDisplay renomeia pipelines conhecidos", () => {
  assert.equal(labelPipelineDisplay(SALES_PIPELINE_ID, "Vendas"), NAV_LABELS.campaignPipeline);
  assert.equal(labelPipelineDisplay(PROJECTS_PIPELINE_ID, "Projetos"), NAV_LABELS.projetos);
  assert.equal(labelPipelineDisplay("custom", "Custom"), "Custom");
});

test("creatorPageTitle e portalPageTitle usam sufixo GlowUP", () => {
  assert.match(creatorPageTitle("Configurações"), /GlowUP$/);
  assert.match(portalPageTitle("Início"), /Portal da Marca$/);
});

test("resolveAppBreadcrumbs gera trilha para pipeline de parcerias", () => {
  const crumbs = resolveAppBreadcrumbs(
    `/t/demo/app/funil/${SALES_PIPELINE_ID}`,
    "demo",
  );
  assert.ok(crumbs.some((c) => c.label === NAV_LABELS.campaignPipeline));
});

test("SIDEBAR_SECTIONS expõe rótulos GlowUP", () => {
  assert.equal(SIDEBAR_SECTIONS.creator, "GlowUP");
  assert.equal(SIDEBAR_SECTIONS.commercial, "Parcerias");
});

console.log("\nTodos os testes de terminology passaram.\n");
