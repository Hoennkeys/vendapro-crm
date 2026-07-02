import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { useCommunications } from "../../store/communications-context";

export function CommunicationsSettings() {
  const { hub } = useCommunications();
  const [slaHours, setSlaHours] = React.useState("4");

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Configurações de Comunicação</CardTitle>
        <CardDescription>SLA, horários e políticas de atendimento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>SLA de resolução (horas)</Label>
          <Input
            type="number"
            value={slaHours}
            onChange={(e) => setSlaHours(e.target.value)}
            min={1}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Canais ativos: {hub.getChannels().length} · Provedores: {hub.listProviders().length}
        </p>
      </CardContent>
    </Card>
  );
}
