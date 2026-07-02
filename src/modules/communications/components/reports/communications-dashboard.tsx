import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommunications } from "../../store/communications-context";
import { getCommunicationsMetrics } from "../../services/metrics.service";
import { MetricsCharts } from "./metrics-charts";

function formatMs(ms: number) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}min`;
}

export function CommunicationsDashboard() {
  const { snapshot, visibleConversations } = useCommunications();
  const metrics = getCommunicationsMetrics(snapshot, visibleConversations);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos hoje</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{metrics.todayConversations}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo médio resposta</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatMs(metrics.avgResponseTimeMs)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tickets abertos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{metrics.openTickets}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de resolução</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {Math.round(metrics.resolutionRate * 100)}%
          </CardContent>
        </Card>
      </div>
      <MetricsCharts metrics={metrics} />
    </div>
  );
}
