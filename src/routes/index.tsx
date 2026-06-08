import { createFileRoute, redirect } from "@tanstack/react-router";
import { getDefaultPortalPath } from "@/lib/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: getDefaultPortalPath(context.session) });
    }
    throw redirect({ to: "/login" });
  },
});
