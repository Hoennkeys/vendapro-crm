import assert from "node:assert/strict";

import { DEMO_CLIENT_ID } from "@/lib/mock-data";
import type { Conversa, Lead } from "@/lib/types";

import { buildChamadoGreetingMessage } from "./chamado-greeting";
import {
  buildConversaFromClient,
  resolveConversaForClient,
  resolveConversasForClient,
} from "./conversa-resolver";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

const leadComClient: Lead = {
  id: "lead-test",
  cliente: "João Cliente ME",
  contato: "João Cliente",
  email: "cliente@demo.com",
  telefone: "(11) 98765-4321",
  valor: 1000,
  etapa: "Em Atendimento",
  prioridade: "Média",
  responsavelId: "user-1",
  criadoEm: "2026-06-01T10:00:00.000Z",
  clientId: DEMO_CLIENT_ID,
  timeline: [],
};

const conversaViaLead: Conversa = {
  id: "conv-via-lead",
  contatoNome: "João Cliente",
  contatoEmpresa: "João Cliente ME",
  telefone: "(11) 98765-4321",
  leadId: "lead-test",
  agenteId: "user-1",
  naoLidas: 0,
  mensagens: [
    {
      id: "m1",
      autor: "cliente",
      texto: "Olá",
      em: "2026-06-10T10:00:00.000Z",
      lida: true,
    },
  ],
};

const conversaViaNome: Conversa = {
  id: "conv-via-nome",
  contatoNome: "João Cliente",
  contatoEmpresa: "João Cliente ME",
  telefone: "",
  agenteId: "user-2",
  naoLidas: 0,
  mensagens: [],
};

console.log("conversa-resolver — testes unitários\n");

test("resolveConversasForClient encontra conversa via lead.clientId", () => {
  const matches = resolveConversasForClient([conversaViaLead], [leadComClient], DEMO_CLIENT_ID);
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.id, "conv-via-lead");
});

test("resolveConversasForClient usa fallback por nome do CLIENT_REGISTRY", () => {
  const matches = resolveConversasForClient([conversaViaNome], [], DEMO_CLIENT_ID);
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.id, "conv-via-nome");
});

test("resolveConversaForClient retorna a conversa com mensagem mais recente", () => {
  const older: Conversa = {
    ...conversaViaLead,
    id: "conv-older",
    mensagens: [
      {
        id: "m-old",
        autor: "cliente",
        texto: "Antiga",
        em: "2026-06-01T10:00:00.000Z",
        lida: true,
      },
    ],
  };
  const newer: Conversa = {
    ...conversaViaLead,
    id: "conv-newer",
    mensagens: [
      {
        id: "m-new",
        autor: "cliente",
        texto: "Recente",
        em: "2026-06-15T10:00:00.000Z",
        lida: true,
      },
    ],
  };

  const resolved = resolveConversaForClient([older, newer], [leadComClient], DEMO_CLIENT_ID);
  assert.equal(resolved?.id, "conv-newer");
});

test("buildConversaFromClient monta dados a partir do registry e lead", () => {
  const draft = buildConversaFromClient(DEMO_CLIENT_ID, [leadComClient], "agent-99");
  assert.ok(draft);
  assert.equal(draft.contatoNome, "João Cliente");
  assert.equal(draft.contatoEmpresa, "João Cliente ME");
  assert.equal(draft.telefone, "(11) 98765-4321");
  assert.equal(draft.leadId, "lead-test");
  assert.equal(draft.agenteId, "agent-99");
});

test("buildConversaFromClient retorna null para clientId desconhecido", () => {
  assert.equal(buildConversaFromClient("client-inexistente", [], "agent-1"), null);
});

test("buildChamadoGreetingMessage usa nome e título do chamado", () => {
  const message = buildChamadoGreetingMessage("João Cliente", "Dúvida sobre fatura");
  assert.ok(message.includes("João Cliente"));
  assert.ok(message.includes("'Dúvida sobre fatura'"));
  assert.ok(message.includes("Já estou analisando o seu caso"));
});
