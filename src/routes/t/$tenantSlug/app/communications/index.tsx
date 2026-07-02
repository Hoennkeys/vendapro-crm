import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/t/$tenantSlug/app/communications/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/t/$tenantSlug/app/communications/inbox",
      params: { tenantSlug: params.tenantSlug },
    });
  },
});
