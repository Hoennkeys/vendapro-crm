import {
  filterChamadosForClient,
  filterFaturasForClient,
  filterProjetosForClient,
  filterPropostasForClient,
} from "./selectors";
import { chamadosMock, faturasMock, pipelineItemsMock, propostasMock } from "../mock-data";

const DEMO_SCOPE = { tenantId: "tenant-demo", clientId: "client-001" };
const ACME_SCOPE = { tenantId: "tenant-acme", clientId: "client-acme-001" };

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log("client-portal (Fase 6) — testes unitários\n");

const demoPropostas = filterPropostasForClient(propostasMock, DEMO_SCOPE);
assert(demoPropostas.length === 2, "demo deve ter 2 propostas");
assert(
  demoPropostas.every((p) => p.clientId === "client-001"),
  "propostas demo filtradas por clientId",
);
assert(
  !demoPropostas.some((p) => p.numero === "PROP-2026-101"),
  "proposta acme não aparece no demo",
);

const acmePropostas = filterPropostasForClient(propostasMock, ACME_SCOPE);
assert(acmePropostas.length === 1, "acme deve ter 1 proposta");
assert(acmePropostas[0].numero === "PROP-2026-101", "proposta acme correta");

const demoProjetos = filterProjetosForClient(pipelineItemsMock, DEMO_SCOPE);
assert(demoProjetos.length === 2, "demo deve ter 2 projetos");
assert(
  !demoProjetos.some((p) => p.titulo.includes("Automação")),
  "projeto acme não aparece no demo",
);

const demoChamados = filterChamadosForClient(chamadosMock, DEMO_SCOPE);
assert(demoChamados.length === 2, "demo deve ter 2 chamados");
assert(demoChamados[0].titulo === "Dúvida sobre fatura", "chamados ordenados por data desc");

const demoFaturas = filterFaturasForClient(faturasMock, DEMO_SCOPE);
assert(demoFaturas.length === 2, "demo deve ter 2 faturas");
assert(
  demoFaturas.every((f) => f.tenantId === "tenant-demo"),
  "faturas filtradas por tenantId",
);

console.log("  ✓ filterPropostasForClient isola por tenant e clientId");
console.log("  ✓ filterProjetosForClient retorna apenas pipeline de projetos");
console.log("  ✓ filterChamadosForClient ordena por criadoEm desc");
console.log("  ✓ filterFaturasForClient isola faturas do cliente");

console.log("\nTodos os testes da Fase 6 passaram.\n");
