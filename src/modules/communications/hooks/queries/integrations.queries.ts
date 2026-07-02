import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCommunications } from "../../store/communications-context";
import type { ProviderConfig } from "../../domain/entities";

export function useProvidersQuery() {
  const { hub, tenantId } = useCommunications();
  return useQuery({
    queryKey: ["communications", tenantId, "providers"],
    queryFn: () => hub.listProviders(),
  });
}

export function useTestProviderConnectionMutation() {
  const { hub, tenantId } = useCommunications();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider: ProviderConfig) => {
      const instance = hub.getProvider(provider.type);
      const status = await instance.connect(provider);
      hub.updateProvider(provider.id, {
        status: status.status,
        lastSyncAt: status.lastSyncAt,
        errorMessage: status.message,
      });
      return status;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["communications", tenantId, "providers"] });
    },
  });
}

export function useUpdateProviderMutation() {
  const { hub, tenantId } = useCommunications();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ProviderConfig> & { id: string }) => {
      const { id, ...rest } = patch;
      hub.updateProvider(id, rest);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["communications", tenantId, "providers"] });
    },
  });
}
