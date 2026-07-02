import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProviderConfig } from "../../domain/entities";
import { ProviderConfigForm } from "./provider-config-form";
import { ConnectionTestButton } from "./connection-test-button";
import { channelIcon } from "../inbox/channel-filter-bar";

type Props = {
  provider: ProviderConfig;
  onChange: (patch: Partial<ProviderConfig>) => void;
};

export function ProviderCard({ provider, onChange }: Props) {
  const Icon = channelIcon(provider.type);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 capitalize">
            <Icon className="h-4 w-4" /> {provider.type}
          </CardTitle>
          <Badge variant={provider.status === "connected" ? "default" : "outline"}>
            {provider.status}
          </Badge>
        </div>
        <CardDescription>
          {provider.enabled ? "Integração habilitada" : "Integração desabilitada"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProviderConfigForm provider={provider} onChange={onChange} />
        <ConnectionTestButton provider={provider} />
        {provider.errorMessage && (
          <p className="text-xs text-destructive">{provider.errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
