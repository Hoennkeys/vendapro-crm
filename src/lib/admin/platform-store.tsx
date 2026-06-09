import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { MOCK_USERS } from "@/lib/auth/mock-users";

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
  createTenant: (input: CreateTenantInput) => PlatformTenant;
  updateTenant: (id: string, updates: UpdateTenantInput) => PlatformTenant;
  deleteTenant: (id: string) => void;
  refresh: () => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<PlatformTenant[]>(() => listPlatformTenants());

  const refresh = useCallback(() => {
    setTenants(listPlatformTenants());
  }, []);

  const createTenant = useCallback(
    (input: CreateTenantInput) => {
      const tenant = createPlatformTenant(input);
      refresh();
      return tenant;
    },
    [refresh],
  );

  const updateTenant = useCallback(
    (id: string, updates: UpdateTenantInput) => {
      const tenant = updatePlatformTenant(id, updates);
      refresh();
      return tenant;
    },
    [refresh],
  );

  const deleteTenant = useCallback(
    (id: string) => {
      deletePlatformTenant(id);
      refresh();
    },
    [refresh],
  );

  const metrics = useMemo(() => computePlatformMetrics(MOCK_USERS.length, tenants), [tenants]);

  const value = useMemo(
    () => ({
      tenants,
      metrics,
      createTenant,
      updateTenant,
      deleteTenant,
      refresh,
    }),
    [tenants, metrics, createTenant, updateTenant, deleteTenant, refresh],
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
