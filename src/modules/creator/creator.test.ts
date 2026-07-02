import assert from "node:assert/strict";
import { computeCreatorMetrics } from "./domain/metrics";
import type { CreatorSnapshot } from "./domain/entities";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("creator — metrics & snapshot\n");

test("computeCreatorMetrics agrega campanhas ativas", () => {
  const snapshot: CreatorSnapshot = {
    brands: [{ id: "b1", tenantId: "t1", name: "A", slug: "a", niche: "x", audienceSize: 1000, platforms: [], status: "active", createdAt: "", updatedAt: "" }],
    agencies: [],
    sponsors: [],
    campaigns: [
      { id: "c1", tenantId: "t1", title: "C1", brandId: "b1", status: "active", budget: 10000, startDate: "2026-01-01", channels: [], createdAt: "", updatedAt: "" },
      { id: "c2", tenantId: "t1", title: "C2", brandId: "b1", status: "draft", budget: 5000, startDate: "2026-01-01", channels: [], createdAt: "", updatedAt: "" },
    ],
  };
  const m = computeCreatorMetrics(snapshot);
  assert.equal(m.activeBrands, 1);
  assert.equal(m.activeCampaigns, 1);
  assert.equal(m.totalCampaignBudget, 15000);
});

console.log("\nTodos os testes de creator passaram.\n");
