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

test("creatorNav contém Overview, Marcas e Campanhas", () => {
  const titles = creatorNav.map((item) => item.title);
  assert.ok(titles.includes("Overview"));
  assert.ok(titles.includes("Marcas"));
  assert.ok(titles.includes("Campanhas"));
  assert.equal(CREATOR_SECTION_LABEL, "Creator OS");
  assert.equal(COMMERCIAL_SECTION_LABEL, "CRM Comercial");
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

test("posVendaNav agrupa Chamados, Faturamento e Projetos", () => {
  const titles = posVendaNav.map((item) => item.title);
  assert.deepEqual(titles, ["Chamados", "Faturamento", "Projetos"]);
  const projetos = posVendaNav.find((item) => item.title === "Projetos");
  assert.ok(projetos && isPipelineNavItem(projetos));
  assert.equal(projetos.pipelineId, PROJECTS_PIPELINE_ID);
});

test("isNavItemActive detecta funil de vendas e projetos separadamente", () => {
  const vendas = commercialNav.find((item) => item.title === "Funil de Vendas")!;
  const projetos = posVendaNav.find((item) => item.title === "Projetos")!;

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
