import { useRouter, useRouteContext } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { authenticate, clearSession, persistSession } from "./session";
import type { Session } from "./types";

type AuthContextValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session } = useRouteContext({ from: "__root__" });

  const login = useCallback(
    async (email: string, password: string) => {
      const nextSession = authenticate(email, password);
      if (!nextSession) {
        throw new Error("E-mail ou senha inválidos.");
      }
      persistSession(nextSession);
      await router.invalidate();
      return nextSession;
    },
    [router],
  );

  const logout = useCallback(async () => {
    clearSession();
    await router.invalidate();
    await router.navigate({ to: "/login" });
  }, [router]);

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
