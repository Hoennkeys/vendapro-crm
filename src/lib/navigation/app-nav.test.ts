import assert from "node:assert/strict";
import {
  commercialNav,
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

test("commercialNav contém Comunicação e não inclui Propostas", () => {
  const titles = commercialNav.map((item) => item.title);
  assert.ok(titles.includes("Comunicação"));
  assert.ok(!titles.includes("Chats"));
  assert.ok(!titles.includes("E-mails"));
  assert.ok(!titles.includes("Propostas"));
  assert.equal(titles.length, 4);
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

test("isNavItemActive trata Comunicação e redirects legados de chats/emails", () => {
  const comunicacao = commercialNav.find((item) => item.title === "Comunicação")!;

  assert.ok(isNavItemActive(`/t/${TENANT}/app/comunicacao`, TENANT, comunicacao));
  assert.ok(isNavItemActive(`/t/${TENANT}/app/chats`, TENANT, comunicacao));
  assert.ok(isNavItemActive(`/t/${TENANT}/app/emails`, TENANT, comunicacao));
  assert.ok(!isNavItemActive(`/t/${TENANT}/app/agenda`, TENANT, comunicacao));
});

test("isPosVendaRouteActive cobre rotas operacionais secundárias", () => {
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/chamados`, TENANT));
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/faturamento`, TENANT));
  assert.ok(isPosVendaRouteActive(`/t/${TENANT}/app/funil/${PROJECTS_PIPELINE_ID}`, TENANT));
  assert.ok(!isPosVendaRouteActive(`/t/${TENANT}/app/painel`, TENANT));
  assert.ok(!isPosVendaRouteActive(`/t/${TENANT}/app/comunicacao`, TENANT));
});

console.log("\nTodos os testes de app-nav passaram.\n");
