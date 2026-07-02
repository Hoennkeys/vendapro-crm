import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  mapLegacySearch,
  inboxSearchToRecord,
} from "@/modules/communications/routes/legacy-redirect";
import type { LegacyComunicacaoSearch } from "@/modules/communications/types/conversation.types";

function optionalSearchString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const Route = createFileRoute("/t/$tenantSlug/app/comunicacao")({
  validateSearch: (search: Record<string, unknown>): LegacyComunicacaoSearch => ({
    tab: search.tab === "emails" ? "emails" : "chats",
    chamadoId: optionalSearchString(search.chamadoId),
    clientId: optionalSearchString(search.clientId),
    chatId: optionalSearchString(search.chatId),
  }),
  beforeLoad: ({ params, search }) => {
    const inboxSearch = mapLegacySearch(search);
    throw redirect({
      to: "/t/$tenantSlug/app/communications/inbox",
      params: { tenantSlug: params.tenantSlug },
      search: inboxSearchToRecord(inboxSearch),
    });
  },
});
