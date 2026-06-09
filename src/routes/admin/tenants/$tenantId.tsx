import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Palette, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { usePlatform } from "@/lib/admin/platform-store";
import { getPlatformTenantById } from "@/lib/admin/tenant-registry";
import type { TenantPlan, TenantStatus } from "@/lib/admin/types";
import { THEME_COLOR_PRESETS } from "@/lib/tenant/defaults";
import type { TenantWhiteLabel } from "@/lib/tenant/types";

export const Route = createFileRoute("/admin/tenants/$tenantId")({
  head: ({ params }) => {
    const tenant = getPlatformTenantById(params.tenantId);
    return { meta: [{ title: `${tenant?.nome ?? "Tenant"} — Admin VendaPro` }] };
  },
  component: TenantDetailPage,
});

const STATUS_LABELS: Record<TenantStatus, string> = {
  active: "Ativo",
  trial: "Trial",
  suspended: "Suspenso",
};

const PLAN_LABELS: Record<TenantPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function TenantDetailPage() {
  const { tenantId } = Route.useParams();
  const { tenants, updateTenant } = usePlatform();
  const tenant = tenants.find((t) => t.id === tenantId);

  const [nome, setNome] = React.useState("");
  const [status, setStatus] = React.useState<TenantStatus>("active");
  const [plan, setPlan] = React.useState<TenantPlan>("starter");
  const [whiteLabel, setWhiteLabel] = React.useState<TenantWhiteLabel | null>(null);

  React.useEffect(() => {
    if (!tenant) return;
    setNome(tenant.nome);
    setStatus(tenant.status);
    setPlan(tenant.plan);
    setWhiteLabel(structuredClone(tenant.whiteLabel));
  }, [tenant]);

  if (!tenant || !whiteLabel) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/tenants">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <p className="text-muted-foreground">Tenant não encontrado.</p>
      </div>
    );
  }

  const handleSave = () => {
    try {
      updateTenant(tenant.id, { nome, status, plan, whiteLabel });
      toast.success("Tenant atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link to="/admin/tenants">
              <ArrowLeft className="h-4 w-4" />
              Tenants
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{tenant.nome}</h1>
            {tenant.isSystem && <Badge variant="outline">Sistema</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            <code>/t/{tenant.slug}/app</code> · ID <code>{tenant.id}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/t/${tenant.slug}/portal`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Portal cliente
            </a>
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados gerais</CardTitle>
            <CardDescription>Informações de cadastro e plano.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome da empresa</Label>
              <Input id="edit-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={tenant.slug} disabled />
              <p className="text-xs text-muted-foreground">
                Slug não pode ser alterado após criação.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TenantStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={plan} onValueChange={(v) => setPlan(v as TenantPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLAN_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Criado em {new Date(tenant.createdAt).toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              White Label
            </CardTitle>
            <CardDescription>
              Personalização exibida no portal do cliente. Também editável em{" "}
              <code className="text-xs">/t/{tenant.slug}/app/configuracoes</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wl-nome">Nome exibido</Label>
              <Input
                id="wl-nome"
                value={whiteLabel.nome}
                onChange={(e) => setWhiteLabel({ ...whiteLabel, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-logo">URL do logo</Label>
              <Input
                id="wl-logo"
                value={whiteLabel.logoUrl ?? ""}
                onChange={(e) =>
                  setWhiteLabel({ ...whiteLabel, logoUrl: e.target.value || undefined })
                }
                placeholder="https://..."
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Preset de cores</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWhiteLabel({ ...whiteLabel, cores: { ...preset.cores } })}
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-full"
                      style={{ background: preset.cores.primary }}
                    />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div
              className="rounded-md border p-4"
              style={{
                background: whiteLabel.cores.primary,
                color: whiteLabel.cores.primaryForeground,
              }}
            >
              <p className="text-sm font-medium">Preview — {whiteLabel.nome}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
