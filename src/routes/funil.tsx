import { createFileRoute, redirect } from "@tanstack/react-router";
import { SALES_PIPELINE_ID } from "@/lib/pipelines/defaults";
import { DEMO_TENANT_SLUG } from "@/lib/tenant/constants";

export const Route = createFileRoute("/funil")({
  beforeLoad: () => {
    throw redirect({
      to: "/t/$tenantSlug/app/funil/$pipelineId",
      params: { tenantSlug: DEMO_TENANT_SLUG, pipelineId: SALES_PIPELINE_ID },
    });
  },
});
