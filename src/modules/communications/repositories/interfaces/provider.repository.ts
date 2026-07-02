import type { ProviderConfig } from "../../domain/entities";

export interface ProviderRepository {
  list(): ProviderConfig[];
  getById(id: string): ProviderConfig | undefined;
  getByType(type: ProviderConfig["type"]): ProviderConfig | undefined;
  save(provider: ProviderConfig): void;
  update(id: string, patch: Partial<ProviderConfig>): void;
}
