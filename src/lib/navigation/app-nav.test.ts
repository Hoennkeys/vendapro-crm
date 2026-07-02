import assert from "node:assert/strict";
import {
  commercialNav,
  communicationsNav,
  creatorNav,
  CREATOR_SECTION_LABEL,
  COMMERCIAL_SECTION_LABEL,
  isCreatorNavActive,
  isCommunicationsNavActive,
  isNavItemActive,
  isPipelineNavItem,
  isPosVendaRouteActive,
  posVendaNav,
} from "./app-nav";
import { NAV_LABELS, SIDEBAR_SECTIONS } from "@/modules/creator/domain/terminology";
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

const TENANT = "demo";

console.log("app-nav — testes unitários\n");

test("creatorNav contém Dashboard, Marcas e Campanhas", () => {
  const titles = creatorNav.map((item) => item.title);
  assert.ok(titles.includes("Dashboard"));
  assert.ok(titles.includes("Marcas"));
  assert.ok(titles.includes("Campanhas"));
  assert.equal(CREATOR_SECTION_LABEL, "GlowUP");
  assert.equal(COMMERCIAL_SECTION_LABEL, SIDEBAR_SECTIONS.commercial);
});

test("isCreatorNavActive cobre rotas creator", () => {
  assert.ok(isCreatorNavActive(`/t/${TENANT}/app/creator`, TENANT));
  assert.ok(isCreatorNavActive(`/t/${TENANT}/app/creator/brands`, TENANT));
  assert.ok(!isCreatorNavActive(`/t/${TENANT}/app/painel`, TENANT));
});

test("commercialNav não inclui Comunicação (movido para grupo Comunicações)", () => {
  const titles = commercialNav.map((item) => item.title);
  assert.ok(!titles.includes("Comunicação"));
  assert.equal(titles.length, 3);
});

test("communicationsNav contém Inbox, Tickets e Integrações", () => {
  const titles = communicationsNav.map((item) => item.title);
  assert.ok(titles.includes("Inbox"));
  assert.ok(titles.includes("Tickets"));
  assert.ok(titles.includes("Integrações"));
  assert.equal(titles.length, 6);
});

test("posVendaNav agrupa Suporte, Faturamento e Projetos", () => {
  const titles = posVendaNav.map((item) => item.title);
  assert.deepEqual(titles, [NAV_LABELS.chamados, NAV_LABELS.faturamento, NAV_LABELS.projetos]);
  const projetos = posVendaNav.find((item) => item.title === NAV_LABELS.projetos);
  assert.ok(projetos && isPipelineNavItem(projetos));
  assert.equal(projetos.pipelineId, PROJECTS_PIPELINE_ID);
});

test("isNavItemActive detecta funil de vendas e projetos separadamente", () => {
  const vendas = commercialNav.find((item) => item.title === NAV_LABELS.campaignPipeline)!;
  const projetos = posVendaNav.find((item) => item.title === NAV_LABELS.projetos)!;

  assert.ok(
    isNavItemActive(`/t/${TENANT}/app/funil/${SALES_PIPELINE_ID}`, TENANT, vendas),
  );
  assert.ok(!isNavItemActive(`/t/${TENANT}/app/funil/${PROJECTS_PIPELINE_ID}`, TENANT, vendas));

  assert.ok(
    isNavItemActive(`/t/${TENANT}/app/funil/${PROJECTS_PIPELINE_ID}`, TENANT, projetos),
  );
  assert.ok(!isNavItemActive(`/t/${TENANT}/app/funil/${SALES_PIPELINE_ID}`, TENANT, projetos));
});

test("isCommunicationsNavActive cobre hub e rotas legadas", () => {
  assert.ok(isCommunicationsNavActive(`/t/${TENANT}/app/communications`, TENANT));
  assert.ok(isCommunicationsNavActive(`/t/${TENANT}/app/communications/inbox`, TENANT));
  assert.ok(isCommunicationsNavActive(`/t/${TENANT}/app/comunicacao`, TENANT));
  assert.ok(isCommunicationsNavActive(`/t/${TENANT}/app/chats`, TENANT));
  assert.ok(isCommunicationsNavActive(`/t/${TENANT}/app/emails`, TENANT));
  assert.ok(!isCommunicationsNavActive(`/t/${TENANT}/app/agenda`, TENANT));
});

test("isNavItemActive marca Inbox ativo no hub", () => {
  const inbox = communicationsNav.find((item) => item.title === "Inbox")!;
  assert.ok(isNavItemActive(`/t/${TENANT}/app/communications/inbox`, TENANT, inbox));
  assert.ok(!isNavItemActive(`/t/${TENANT}/app/communications/tickets`, TENANT, inbox));
});

test("isPosVendaRouteActive cobre rotas operacionais secundárias", () => {
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/chamados`, TENANT));
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/faturamento`, TENANT));
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/funil/${PROJECTS_PIPELINE_ID}`, TENANT));
  assert.ok(!isPosVendaRouteActive(`/t/${TENANT}/app/painel`, TENANT));
  assert.ok(!isPosVendaRouteActive(`/t/${TENANT}/app/communications/inbox`, TENANT));
});

console.log("\nTodos os testes de app-nav passaram.\n");
