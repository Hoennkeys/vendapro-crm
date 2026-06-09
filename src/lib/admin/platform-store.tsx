import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createTenantServerFn,
  deleteTenantServerFn,
  getPlatformMetricsServerFn,
  listTenantsServerFn,
  updateTenantServerFn,
} from "@/lib/api/tenants.functions";
import { isClientServerApiEnabled } from "@/lib/client/server-api";

import {
  computePlatformMetrics,
  createPlatformTenant,
  deletePlatformTenant,
  listPlatformTenants,
  updatePlatformTenant,
} from "./tenant-registry";
import type {
  CreateTenantInput,
  PlatformMetrics,
  PlatformTenant,
  UpdateTenantInput,
} from "./types";

type PlatformContextValue = {
  tenants: PlatformTenant[];
  metrics: PlatformMetrics;
  loading: boolean;
  createTenant: (input: CreateTenantInput) => Promise<PlatformTenant>;
  updateTenant: (id: string, updates: UpdateTenantInput) => Promise<PlatformTenant>;
  deleteTenant: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

const EMPTY_METRICS: PlatformMetrics = {
  totalTenants: 0,
  activeTenants: 0,
  trialTenants: 0,
  suspendedTenants: 0,
  totalUsers: 0,
  mrrEstimate: 0,
};

export function PlatformProvider({ children }: { children: ReactNode }) {
  const useServerApi = isClientServerApiEnabled();
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (useServerApi) {
      const [nextTenants, nextMetrics] = await Promise.all([
        listTenantsServerFn(),
        getPlatformMetricsServerFn(),
      ]);
      setTenants(nextTenants);
      setMetrics(nextMetrics);
      return;
    }

    const localTenants = listPlatformTenants();
    setTenants(localTenants);
    setMetrics(computePlatformMetrics(5, localTenants));
  }, [useServerApi]);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createTenant = useCallback(
    async (input: CreateTenantInput) => {
      if (useServerApi) {
        const tenant = await createTenantServerFn({
          data: {
            nome: input.nome,
            slug: input.slug,
            plan: input.plan,
            status: input.status,
          },
        });
        await refresh();
        return tenant;
      }

      const tenant = createPlatformTenant(input);
      await refresh();
      return tenant;
    },
    [refresh, useServerApi],
  );

  const updateTenant = useCallback(
    async (id: string, updates: UpdateTenantInput) => {
      if (useServerApi) {
        const tenant = await updateTenantServerFn({ data: { tenantId: id, updates } });
        await refresh();
        return tenant;
      }

      const tenant = updatePlatformTenant(id, updates);
      await refresh();
      return tenant;
    },
    [refresh, useServerApi],
  );

  const deleteTenant = useCallback(
    async (id: string) => {
      if (useServerApi) {
        await deleteTenantServerFn({ data: { tenantId: id } });
        await refresh();
        return;
      }

      deletePlatformTenant(id);
      await refresh();
    },
    [refresh, useServerApi],
  );

  const value = useMemo(
    () => ({
      tenants,
      metrics,
      loading,
      createTenant,
      updateTenant,
      deleteTenant,
      refresh,
    }),
    [tenants, metrics, loading, createTenant, updateTenant, deleteTenant, refresh],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform deve ser usado dentro de PlatformProvider.");
  }
  return context;
}
