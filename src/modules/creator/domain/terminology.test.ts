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
  assert.equal(CREATOR_TERMS.client, "Brand");
  assert.equal(CREATOR_TERMS.lead, "Partnership Opportunity");
  assert.equal(CREATOR_TERMS.sale, "Campaign Revenue");
  assert.equal(CREATOR_TERMS.funnel, "Campaign Pipeline");
  assert.equal(CREATOR_TERMS.portal, "Brand Portal");
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
  assert.equal(labelPipelineDisplay(SALES_PIPELINE_ID, "Vendas"), CREATOR_TERMS.funnel);
  assert.equal(labelPipelineDisplay(PROJECTS_PIPELINE_ID, "Projetos"), NAV_LABELS.projetos);
  assert.equal(labelPipelineDisplay("custom", "Custom"), "Custom");
});

test("creatorPageTitle e portalPageTitle usam sufixo Creator OS", () => {
  assert.match(creatorPageTitle("Configurações"), /Creator OS$/);
  assert.match(portalPageTitle("Início"), /Brand Portal$/);
});

test("resolveAppBreadcrumbs gera trilha para funil de vendas", () => {
  const crumbs = resolveAppBreadcrumbs(
    `/t/demo/app/funil/${SALES_PIPELINE_ID}`,
    "demo",
  );
  assert.ok(crumbs.some((c) => c.label === CREATOR_TERMS.funnel));
});

test("SIDEBAR_SECTIONS expõe rótulos Creator", () => {
  assert.equal(SIDEBAR_SECTIONS.creator, "Creator OS");
  assert.equal(SIDEBAR_SECTIONS.commercial, "Campaign Revenue");
});

console.log("\nTodos os testes de terminology passaram.\n");
