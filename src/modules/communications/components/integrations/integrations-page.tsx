import { useProvidersQuery, useUpdateProviderMutation } from "../../hooks/use-providers";
import { canConfigureIntegrations } from "../../domain/permissions";
import { useCommunications } from "../../store/communications-context";
import { ProviderCard } from "./provider-card";

export function IntegrationsPage() {
  const { data: providers = [] } = useProvidersQuery();
  const update = useUpdateProviderMutation();
  const { role } = useCommunications();

  if (!role || !canConfigureIntegrations(role)) {
    return (
      <p className="text-sm text-muted-foreground">
        Apenas administradores podem configurar integrações.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {providers.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          onChange={(patch) => update.mutate({ id: p.id, ...patch })}
        />
      ))}
    </div>
  );
}
