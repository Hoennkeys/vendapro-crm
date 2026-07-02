import assert from "node:assert/strict";
import { mapLegacySearch, mapLegacyChatsSearch, mapLegacyEmailsSearch } from "./routes/legacy-redirect";
import {
  migrateLegacyCommunications,
  conversaToConversation,
} from "./domain/legacy-adapter";
import {
  syncTicketsFromChamados,
  syncChamadosFromTicket,
} from "./domain/chamado-ticket-sync";
import { mapChamadoStatus, mapTicketStatusToChamado } from "./domain/metrics";
import type { Conversa, EmailMsg, Chamado } from "@/lib/types";
import type { Ticket } from "./domain/entities";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("communications — legacy redirect & adapter\n");

test("mapLegacySearch preserva deep-links de comunicacao", () => {
  const mapped = mapLegacySearch({
    tab: "chats",
    chamadoId: "ch-1",
    clientId: "cl-1",
    chatId: "conv-1",
  });
  assert.equal(mapped.chamadoId, "ch-1");
  assert.equal(mapped.clientId, "cl-1");
  assert.equal(mapped.conversationId, "conv-1");
});

test("mapLegacySearch tab emails → channel email", () => {
  const mapped = mapLegacySearch({ tab: "emails" });
  assert.equal(mapped.channel, "email");
});

test("mapLegacyChatsSearch → internal", () => {
  assert.equal(mapLegacyChatsSearch().channel, "internal");
});

test("mapLegacyEmailsSearch → email", () => {
  assert.equal(mapLegacyEmailsSearch().channel, "email");
});

test("migrateLegacyCommunications importa conversas legadas", () => {
  const conversas: Conversa[] = [
    {
      id: "conv-1",
      contatoNome: "João",
      contatoEmpresa: "Acme",
      telefone: "119999",
      agenteId: "u1",
      naoLidas: 1,
      mensagens: [
        { id: "m1", autor: "cliente", texto: "Oi", em: "2026-01-01T10:00:00Z", lida: false },
      ],
    },
  ];
  const snapshot = migrateLegacyCommunications({
    tenantId: "demo",
    conversas,
    emails: [],
    chamados: [],
  });
  assert.ok(snapshot.migratedV1);
  assert.ok(snapshot.conversations.some((c) => c.legacyConversaId === "conv-1"));
  assert.ok(snapshot.messages.length >= 1);
});

test("conversaToConversation mantém unread", () => {
  const conv = conversaToConversation(
    {
      id: "c1",
      contatoNome: "A",
      contatoEmpresa: "B",
      telefone: "1",
      agenteId: "u",
      naoLidas: 3,
      mensagens: [],
    },
    "demo",
    "ch-internal",
  );
  assert.equal(conv.unreadCount, 3);
  assert.equal(conv.channelType, "internal");
});

test("migrateLegacyCommunications injeta mocks apenas no tenant demo", () => {
  const demoSnapshot = migrateLegacyCommunications({
    tenantId: "tenant-demo",
    conversas: [],
    emails: [],
    chamados: [],
  });
  assert.ok(demoSnapshot.conversations.some((c) => c.id.includes("_mock_")));

  const prodSnapshot = migrateLegacyCommunications({
    tenantId: "tenant-acme",
    conversas: [],
    emails: [],
    chamados: [],
  });
  assert.ok(!prodSnapshot.conversations.some((c) => c.id.includes("_mock_")));
});

test("syncTicketsFromChamados reflete status do chamado", () => {
  const tickets: Ticket[] = [
    {
      id: "ticket_legacy_ch-1",
      tenantId: "demo",
      clientId: "cl-1",
      title: "Suporte",
      description: "desc",
      status: "open",
      priority: "medium",
      createdAt: "2026-01-01T10:00:00Z",
      updatedAt: "2026-01-01T10:00:00Z",
      legacyChamadoId: "ch-1",
    },
  ];
  const chamados: Chamado[] = [
    {
      id: "ch-1",
      tenantId: "demo",
      clientId: "cl-1",
      titulo: "Suporte",
      descricao: "desc",
      status: "Em andamento",
      criadoEm: "2026-01-01T10:00:00Z",
      atualizadoEm: "2026-01-02T10:00:00Z",
    },
  ];

  const synced = syncTicketsFromChamados(tickets, chamados);
  assert.equal(synced[0]?.status, "in_progress");
});

test("syncChamadosFromTicket reflete status do ticket", () => {
  const chamados: Chamado[] = [
    {
      id: "ch-1",
      tenantId: "demo",
      clientId: "cl-1",
      titulo: "Suporte",
      descricao: "desc",
      status: "Aberto",
      criadoEm: "2026-01-01T10:00:00Z",
      atualizadoEm: "2026-01-01T10:00:00Z",
    },
  ];
  const ticket: Ticket = {
    id: "ticket_legacy_ch-1",
    tenantId: "demo",
    clientId: "cl-1",
    title: "Suporte",
    description: "desc",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-03T10:00:00Z",
    legacyChamadoId: "ch-1",
  };

  const synced = syncChamadosFromTicket(chamados, ticket);
  assert.equal(synced[0]?.status, "Resolvido");
});

test("mappers chamado ↔ ticket são inversos", () => {
  const statuses = ["Aberto", "Em andamento", "Resolvido", "Fechado"] as const;
  for (const status of statuses) {
    const ticketStatus = mapChamadoStatus(status);
    assert.equal(mapTicketStatusToChamado(ticketStatus), status);
  }
});

console.log("\nTodos os testes de communications passaram.\n");
