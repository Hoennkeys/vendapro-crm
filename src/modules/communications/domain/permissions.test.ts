import assert from "node:assert/strict";
import {
  canViewConversation,
  canConfigureIntegrations,
  filterConversationsForRole,
} from "./permissions";
import type { Conversation } from "./entities";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

const conv: Conversation = {
  id: "1",
  tenantId: "demo",
  channelId: "ch1",
  channelType: "internal",
  participants: [],
  assignedEmployeeId: "emp-1",
  clientId: "client-1",
  unreadCount: 0,
  lastMessageAt: new Date().toISOString(),
  status: "open",
  tags: [],
};

console.log("communications permissions\n");

test("ADMIN vê qualquer conversa", () => {
  assert.ok(canViewConversation("ADMIN", conv, { userId: "x", leads: [], clientId: "y" }));
});

test("CLIENT só vê próprias conversas", () => {
  assert.ok(canViewConversation("CLIENT", conv, { userId: "c", clientId: "client-1", leads: [] }));
  assert.ok(!canViewConversation("CLIENT", conv, { userId: "c", clientId: "other", leads: [] }));
});

test("OPERATIONAL vê conversas atribuídas", () => {
  assert.ok(canViewConversation("OPERATIONAL", conv, { userId: "emp-1", leads: [] }));
  assert.ok(!canViewConversation("OPERATIONAL", conv, { userId: "emp-2", leads: [] }));
});

test("canConfigureIntegrations só ADMIN", () => {
  assert.ok(canConfigureIntegrations("ADMIN"));
  assert.ok(!canConfigureIntegrations("OPERATIONAL"));
});

test("filterConversationsForRole CLIENT", () => {
  const other = { ...conv, id: "2", clientId: "other" };
  const filtered = filterConversationsForRole("CLIENT", [conv, other], {
    userId: "c",
    clientId: "client-1",
    leads: [],
    usuarios: [],
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "1");
});

console.log("\nPermissões OK.\n");
