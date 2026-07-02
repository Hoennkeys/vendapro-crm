import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunicationsMetrics } from "../../domain/metrics";

export function MetricsCharts({ metrics }: { metrics: CommunicationsMetrics }) {
  const channelData = Object.entries(metrics.messagesByChannel).map(([channel, count]) => ({
    channel,
    count,
  }));

  const userData = Object.entries(metrics.messagesByUser).map(([user, count]) => ({
    user: user.slice(0, 12),
    count,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensagens por canal</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensagens por usuário</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
