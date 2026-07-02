import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestProviderConnectionMutation } from "../../hooks/use-providers";
import type { ProviderConfig } from "../../domain/entities";

export function ConnectionTestButton({ provider }: { provider: ProviderConfig }) {
  const test = useTestProviderConnectionMutation();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={test.isPending}
      onClick={() => test.mutate(provider)}
    >
      {test.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar conexão"}
    </Button>
  );
}
