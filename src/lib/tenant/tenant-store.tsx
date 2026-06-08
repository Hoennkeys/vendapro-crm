import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { applyFavicon, applyTheme, clearFavicon, clearTheme } from "./apply-theme";
import { getDefaultWhiteLabel } from "./defaults";
import { loadTenantWhiteLabel, persistTenantWhiteLabel } from "./storage";
import type { TenantThemeColors, TenantWhiteLabel } from "./types";

type TenantContextValue = {
  tenantSlug: string;
  whiteLabel: TenantWhiteLabel;
  updateWhiteLabel: (updates: Partial<TenantWhiteLabel>) => void;
  updateThemeColors: (cores: TenantThemeColors) => void;
  resetWhiteLabel: () => void;
};

const TenantContext = createContext<TenantContextValue | null>(null);

type TenantProviderProps = {
  tenantSlug: string;
  children: ReactNode;
};

export function TenantProvider({ tenantSlug, children }: TenantProviderProps) {
  const [whiteLabel, setWhiteLabel] = useState<TenantWhiteLabel>(() =>
    loadTenantWhiteLabel(tenantSlug),
  );

  useEffect(() => {
    setWhiteLabel(loadTenantWhiteLabel(tenantSlug));
  }, [tenantSlug]);

  const updateWhiteLabel = useCallback(
    (updates: Partial<TenantWhiteLabel>) => {
      setWhiteLabel((prev) => {
        const next: TenantWhiteLabel = {
          ...prev,
          ...updates,
          cores: updates.cores ? { ...prev.cores, ...updates.cores } : prev.cores,
        };
        persistTenantWhiteLabel(tenantSlug, next);
        return next;
      });
    },
    [tenantSlug],
  );

  const updateThemeColors = useCallback(
    (cores: TenantThemeColors) => {
      updateWhiteLabel({ cores });
    },
    [updateWhiteLabel],
  );

  const resetWhiteLabel = useCallback(() => {
    const defaults = getDefaultWhiteLabel(tenantSlug);
    if (!defaults) return;
    persistTenantWhiteLabel(tenantSlug, defaults);
    setWhiteLabel(defaults);
  }, [tenantSlug]);

  const value = useMemo(
    () => ({
      tenantSlug,
      whiteLabel,
      updateWhiteLabel,
      updateThemeColors,
      resetWhiteLabel,
    }),
    [tenantSlug, whiteLabel, updateWhiteLabel, updateThemeColors, resetWhiteLabel],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant deve ser usado dentro de TenantProvider.");
  }
  return context;
}

export function usePortalTheme() {
  const { whiteLabel } = useTenant();

  useEffect(() => {
    applyTheme(whiteLabel.cores);
    applyFavicon(whiteLabel.faviconUrl);

    return () => {
      clearTheme();
      clearFavicon();
    };
  }, [whiteLabel]);
}
