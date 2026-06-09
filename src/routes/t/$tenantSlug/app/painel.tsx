import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Wallet, Target, Percent, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brl } from "@/lib/format";
import { etapas } from "@/lib/mock-data";

export const Route = createFileRoute("/t/$tenantSlug/app/painel")({
  head: () => ({ meta: [{ title: "Painel — VendaPro CRM" }] }),
  component: Painel,
});

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function ultimos6Meses() {
  const hoje = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    return { ano: d.getFullYear(), mes: d.getMonth(), label: MESES[d.getMonth()] };
  });
}

function Painel() {
  const { leads, usuarios, filtroVendedor, setFiltroVendedor } = useCrm();

  const leadsFiltrados = React.useMemo(
    () =>
      filtroVendedor === "todos" ? leads : leads.filter((l) => l.responsavelId === filtroVendedor),
    [leads, filtroVendedor],
  );

  const pipeline = leadsFiltrados
    .filter((l) => l.etapa !== "Ganho" && l.etapa !== "Perdido")
    .reduce((acc, l) => acc + l.valor, 0);
  const faturamento = leadsFiltrados
    .filter((l) => l.etapa === "Ganho")
    .reduce((a, l) => a + l.valor, 0);
  const ganhos = leadsFiltrados.filter((l) => l.etapa === "Ganho").length;
  const fechados = leadsFiltrados.filter(
    (l) => l.etapa === "Ganho" || l.etapa === "Perdido",
  ).length;
  const conversao = fechados ? Math.round((ganhos / fechados) * 100) : 0;
  const meta = 0;
  const progressoMeta = meta > 0 ? Math.min(100, Math.round((faturamento / meta) * 100)) : 0;

  const porEtapa = etapas.map((e) => ({
    etapa: e,
    quantidade: leadsFiltrados.filter((l) => l.etapa === e).length,
  }));

  const porVendedor = usuarios
    .filter((u) => filtroVendedor === "todos" || u.id === filtroVendedor)
    .map((u) => ({
      nome: u.nome.split(" ")[0],
      vendas: leadsFiltrados
        .filter((l) => l.responsavelId === u.id && l.etapa === "Ganho")
        .reduce((a, l) => a + l.valor, 0),
      destaque: filtroVendedor === u.id,
    }));

  const faturamentoMensal = React.useMemo(
    () =>
      ultimos6Meses().map(({ ano, mes, label }) => ({
        mes: label,
        faturamento: leadsFiltrados
          .filter((l) => {
            if (l.etapa !== "Ganho") return false;
            const d = new Date(l.criadoEm);
            return d.getFullYear() === ano && d.getMonth() === mes;
          })
          .reduce((a, l) => a + l.valor, 0),
      })),
    [leadsFiltrados],
  );

  const atividades = React.useMemo(() => {
    const base =
      filtroVendedor === "todos" ? leads : leads.filter((l) => l.responsavelId === filtroVendedor);
    return base
      .flatMap((l) =>
        l.timeline.map((t, i) => ({
          id: `${l.id}-${i}`,
          em: t.em,
          texto: `${l.cliente}: ${t.texto}`,
          vendedorId: l.responsavelId,
        })),
      )
      .sort((a, b) => new Date(b.em).getTime() - new Date(a.em).getTime())
      .slice(0, 10);
  }, [leads, filtroVendedor]);

  const coresEtapa = ["#94a3b8", "#6366f1", "#f59e0b", "#16a34a", "#dc2626"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
          <p className="text-sm text-muted-foreground">Visão geral das suas vendas e equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vendedor:</span>
          <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<Wallet className="h-4 w-4" />}
          label="Faturamento do Mês"
          value={brl(faturamento)}
          hint={ganhos ? `${ganhos} negócio(s) ganho(s)` : "Nenhuma venda fechada ainda"}
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Valor do Pipeline"
          value={brl(pipeline)}
          hint={`${leadsFiltrados.length} oportunidades`}
        />
        <Kpi
          icon={<Percent className="h-4 w-4" />}
          label="Taxa de Conversão"
          value={`${conversao}%`}
          hint={`${ganhos} ganhos de ${fechados} fechados`}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" /> Meta da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{brl(faturamento)}</div>
            <div className="text-xs text-muted-foreground mb-2">
              {meta > 0 ? `de ${brl(meta)}` : "Meta não definida"}
            </div>
            <Progress value={progressoMeta} />
            <div className="mt-1 text-xs text-muted-foreground">
              {meta > 0 ? `${progressoMeta}% atingido` : "Configure a meta em Configurações"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {faturamentoMensal.every((m) => m.faturamento === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem faturamento registrado. Feche negócios no funil para ver o gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="mes" stroke="currentColor" fontSize={12} />
                  <YAxis
                    stroke="currentColor"
                    fontSize={12}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => brl(Number(v))}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="faturamento"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Faturamento"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads por Etapa</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {leadsFiltrados.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum lead cadastrado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porEtapa}
                    dataKey="quantidade"
                    nameKey="etapa"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {porEtapa.map((_, i) => (
                      <Cell key={i} fill={coresEtapa[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas por Vendedor</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {porVendedor.every((v) => v.vendas === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma venda fechada por vendedor.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porVendedor}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="nome" fontSize={12} stroke="currentColor" />
                  <YAxis
                    fontSize={12}
                    stroke="currentColor"
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => brl(Number(v))}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="vendas" radius={[6, 6, 0, 0]}>
                    {porVendedor.map((d, i) => (
                      <Cell key={i} fill={d.destaque ? "var(--primary)" : "var(--chart-2)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atividades.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sem atividades. Interações nos leads aparecem aqui automaticamente.
              </p>
            )}
            {atividades.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p>{a.texto}</p>
                  <p className="text-xs text-muted-foreground">
                    {nomeVendedor(usuarios, a.vendedorId)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {new Date(a.em).toLocaleDateString("pt-BR")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
