import assert from "node:assert/strict";
import { leadToPipelineItem, leadsToPipelineItems, stageIdToEtapa } from "./adapter";
import {
  ETAPA_TO_STAGE_ID,
  SALES_PIPELINE_ID,
  STAGE_ID_TO_ETAPA,
  createDefaultSalesPipeline,
  getPipelineById,
  getPipelinesForTenant,
} from "./defaults";
import type { Lead } from "@/lib/types";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

const sampleLead: Lead = {
  id: "l_test",
  cliente: "Acme Corp",
  contato: "João",
  email: "joao@acme.com",
  telefone: "11999999999",
  valor: 15000,
  etapa: "Em Atendimento",
  prioridade: "Alta",
  responsavelId: "u1",
  criadoEm: "2025-01-15T10:00:00.000Z",
  timeline: [{ tipo: "ligacao", em: "2025-01-16T10:00:00.000Z", texto: "Primeiro contato" }],
};

console.log("pipelines — testes unitários\n");

test("mapeamento Etapa ↔ stageId é bidirecional", () => {
  for (const etapa of Object.keys(ETAPA_TO_STAGE_ID) as Lead["etapa"][]) {
    const stageId = ETAPA_TO_STAGE_ID[etapa];
    assert.equal(STAGE_ID_TO_ETAPA[stageId], etapa);
    assert.equal(stageIdToEtapa(stageId), etapa);
  }
});

test("leadToPipelineItem preserva dados do lead", () => {
  const item = leadToPipelineItem(sampleLead);
  assert.equal(item.id, sampleLead.id);
  assert.equal(item.pipelineId, SALES_PIPELINE_ID);
  assert.equal(item.stageId, ETAPA_TO_STAGE_ID["Em Atendimento"]);
  assert.equal(item.titulo, sampleLead.cliente);
  assert.equal(item.dados.valor, sampleLead.valor);
  assert.equal(item.dados.prioridade, sampleLead.prioridade);
  assert.equal(item.timeline.length, 1);
});

test("leadsToPipelineItems converte lista completa", () => {
  const items = leadsToPipelineItems([sampleLead, { ...sampleLead, id: "l2", etapa: "Ganho" }]);
  assert.equal(items.length, 2);
  assert.equal(items[1].stageId, ETAPA_TO_STAGE_ID.Ganho);
});

test("pipeline Vendas tem 5 etapas na ordem correta", () => {
  const pipeline = createDefaultSalesPipeline("tenant-demo");
  assert.equal(pipeline.stages.length, 5);
  assert.deepEqual(
    pipeline.stages.map((s) => s.label),
    ["Sem Contato", "Em Atendimento", "Proposta Enviada", "Ganho", "Perdido"],
  );
  assert.equal(pipeline.stages[0].id, "sem-contato");
});

test("getPipelinesForTenant retorna Vendas + Projetos", () => {
  const pipelines = getPipelinesForTenant("tenant-demo");
  assert.equal(pipelines.length, 2);
  assert.equal(pipelines[0].nome, "Vendas");
  assert.equal(pipelines[1].nome, "Projetos");
});

test("getPipelineById encontra pipeline válido e rejeita inválido", () => {
  assert.ok(getPipelineById("tenant-demo", SALES_PIPELINE_ID));
  assert.equal(getPipelineById("tenant-demo", "inexistente"), undefined);
});

test("stageId desconhecido retorna undefined", () => {
  assert.equal(stageIdToEtapa("etapa-fantasma"), undefined);
});

test("lead com etapa inválida cai em Sem Contato", () => {
  const corrupt = { ...sampleLead, etapa: "Etapa Fantasma" as Lead["etapa"] };
  const item = leadToPipelineItem(corrupt);
  assert.equal(item.stageId, ETAPA_TO_STAGE_ID["Sem Contato"]);
});

console.log("\nTodos os testes passaram.");
