import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/t/$tenantSlug/app/emails")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/t/$tenantSlug/app/comunicacao",
      params: { tenantSlug: params.tenantSlug },
      search: { tab: "emails" },
    });
  },
});
