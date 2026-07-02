import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommunications } from "../../store/communications-context";
import { channelIcon } from "../inbox/channel-filter-bar";

export function ChannelStatusGrid() {
  const { snapshot, hub } = useCommunications();
  const channels = hub.getChannels();
  const providers = snapshot.providers;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {channels.map((ch) => {
        const provider = providers.find((p) => p.id === ch.providerId);
        const Icon = channelIcon(ch.type);
        const convCount = snapshot.conversations.filter((c) => c.channelId === ch.id).length;
        return (
          <Card key={ch.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" /> {ch.name}
                </CardTitle>
                <Badge variant={provider?.status === "connected" ? "default" : "secondary"}>
                  {provider?.status ?? "disconnected"}
                </Badge>
              </div>
              <CardDescription>{convCount} conversas</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {provider?.errorMessage ?? provider?.lastSyncAt ?? "Não sincronizado"}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
