import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/auth-store";
import { useCrm } from "@/lib/crm-store";
import { useTenant } from "@/lib/tenant/tenant-store";
import type { CommunicationsSnapshot } from "../domain/entities";
import { migrateLegacyCommunications } from "../domain/legacy-adapter";
import {
  filterConversationsForRole,
  filterMessagesForRole,
  filterTicketsForRole,
  resolveAuthRole,
} from "../domain/permissions";
import { createCommunicationsRepositories } from "../repositories/repository-factory";
import { CommunicationHubService } from "../services/communication-hub.service";
import { countUnread } from "../services/metrics.service";
import { commsDevLog } from "../lib/dev-diagnostics";

type CommunicationsContextValue = {
  tenantId: string;
  hub: CommunicationHubService;
  snapshot: CommunicationsSnapshot;
  role: ReturnType<typeof resolveAuthRole>;
  visibleConversations: ReturnType<typeof filterConversationsForRole>;
  visibleTickets: ReturnType<typeof filterTicketsForRole>;
  filterMessages: typeof filterMessagesForRole;
  totalUnread: number;
  refresh: () => void;
};

const CommunicationsContext = React.createContext<CommunicationsContextValue | null>(null);

export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const { whiteLabel } = useTenant();
  const { session } = useAuth();
  const crm = useCrm();
  const queryClient = useQueryClient();
  const tenantId = whiteLabel.tenantId;

  const snapshot = React.useMemo(
    () =>
      migrateLegacyCommunications({
        tenantId,
        conversas: crm.conversas,
        emails: crm.emails,
        chamados: crm.chamados,
        existing: crm.communications,
      }),
    [tenantId, crm.conversas, crm.emails, crm.chamados, crm.communications],
  );

  const repos = React.useMemo(
    () =>
      createCommunicationsRepositories({
        tenantId,
        getSnapshot: () => crm.getCommunications(),
        setSnapshot: (updater) => {
          crm.setCommunications(updater);
          void queryClient.invalidateQueries({ queryKey: ["communications", tenantId] });
        },
      }),
    [crm, queryClient, tenantId],
  );

  React.useEffect(() => {
    commsDevLog("snapshot hydrated", {
      tenantId,
      conversations: snapshot.conversations.length,
      tickets: snapshot.tickets.length,
      storageProvider: repos.storageProvider,
    });
  }, [tenantId, snapshot.conversations.length, snapshot.tickets.length, repos.storageProvider]);

  const hub = React.useMemo(
    () => new CommunicationHubService(tenantId, repos),
    [tenantId, repos],
  );

  React.useEffect(() => {
    void hub.init();
  }, [hub]);

  const role = resolveAuthRole(session);
  const userId = session?.user.id ?? "";
  const clientId = session?.user.clientId;

  const visibleConversations = React.useMemo(() => {
    if (!role) return snapshot.conversations;
    return filterConversationsForRole(role, snapshot.conversations, {
      userId,
      clientId,
      leads: crm.leads,
      usuarios: crm.usuarios,
    });
  }, [role, snapshot.conversations, userId, clientId, crm.leads, crm.usuarios]);

  const visibleTickets = React.useMemo(() => {
    if (!role) return snapshot.tickets;
    return filterTicketsForRole(role, snapshot.tickets, { userId, clientId });
  }, [role, snapshot.tickets, userId, clientId]);

  const refresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["communications", tenantId] });
  }, [queryClient, tenantId]);

  const value: CommunicationsContextValue = {
    tenantId,
    hub,
    snapshot,
    role,
    visibleConversations,
    visibleTickets,
    filterMessages: filterMessagesForRole,
    totalUnread: countUnread(visibleConversations),
    refresh,
  };

  return (
    <CommunicationsContext.Provider value={value}>{children}</CommunicationsContext.Provider>
  );
}

export function useCommunications() {
  const ctx = React.useContext(CommunicationsContext);
  if (!ctx) throw new Error("useCommunications precisa de CommunicationsProvider");
  return ctx;
}
