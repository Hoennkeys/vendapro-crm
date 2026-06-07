import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Wallet, Target, Percent, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCrm, nomeVendedor } from "@/lib/crm-store";
import { brl } from "@/lib/format";
import { atividadesRecentesMock, faturamentoMensalMock, etapas } from "@/lib/mock-data";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel — VendaPro CRM" }] }),
  component: Painel,
});

function Painel() {
  const { leads, usuarios, filtroVendedor, setFiltroVendedor } = useCrm();

  const leadsFiltrados = React.useMemo(
    () => (filtroVendedor === "todos" ? leads : leads.filter((l) => l.responsavelId === filtroVendedor)),
    [leads, filtroVendedor],
  );

  const pipeline = leadsFiltrados
    .filter((l) => l.etapa !== "Ganho" && l.etapa !== "Perdido")
    .reduce((acc, l) => acc + l.valor, 0);
  const faturamento = leadsFiltrados.filter((l) => l.etapa === "Ganho").reduce((a, l) => a + l.valor, 0);
  const ganhos = leadsFiltrados.filter((l) => l.etapa === "Ganho").length;
  const fechados = leadsFiltrados.filter((l) => l.etapa === "Ganho" || l.etapa === "Perdido").length;
  const conversao = fechados ? Math.round((ganhos / fechados) * 100) : 0;
  const meta = 200000;
  const progressoMeta = Math.min(100, Math.round((faturamento / meta) * 100));

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

  const coresEtapa = ["#94a3b8", "#6366f1", "#f59e0b", "#16a34a", "#dc2626"];

  const atividades = filtroVendedor === "todos"
    ? atividadesRecentesMock
    : atividadesRecentesMock.filter((a) => a.vendedorId === filtroVendedor);

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
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Wallet className="h-4 w-4" />} label="Faturamento do Mês" value={brl(faturamento)} hint="+12% vs. mês anterior" />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Valor do Pipeline" value={brl(pipeline)} hint={`${leadsFiltrados.length} oportunidades`} />
        <Kpi icon={<Percent className="h-4 w-4" />} label="Taxa de Conversão" value={`${conversao}%`} hint={`${ganhos} ganhos de ${fechados} fechados`} />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Target className="h-4 w-4" /> Meta da Equipe</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{brl(faturamento)}</div>
            <div className="text-xs text-muted-foreground mb-2">de {brl(meta)}</div>
            <Progress value={progressoMeta} />
            <div className="mt-1 text-xs text-muted-foreground">{progressoMeta}% atingido</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Faturamento — últimos 6 meses</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={faturamentoMensalMock}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="mes" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => brl(Number(v))} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="faturamento" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads por Etapa</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porEtapa} dataKey="quantidade" nameKey="etapa" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {porEtapa.map((_, i) => <Cell key={i} fill={coresEtapa[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Vendas por Vendedor</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porVendedor}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="nome" fontSize={12} stroke="currentColor" />
                <YAxis fontSize={12} stroke="currentColor" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => brl(Number(v))} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="vendas" radius={[6, 6, 0, 0]}>
                  {porVendedor.map((d, i) => (
                    <Cell key={i} fill={d.destaque ? "var(--primary)" : "var(--chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Atividades Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {atividades.length === 0 && <p className="text-sm text-muted-foreground">Sem atividades.</p>}
            {atividades.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1.5"><ArrowUpRight className="h-3 w-3 text-primary" /></div>
                <div className="flex-1">
                  <p>{a.texto}</p>
                  <p className="text-xs text-muted-foreground">{nomeVendedor(usuarios, a.vendedorId)}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{new Date(a.em).toLocaleDateString("pt-BR")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
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