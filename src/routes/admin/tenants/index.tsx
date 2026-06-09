import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, ExternalLink, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatform } from "@/lib/admin/platform-store";
import { slugify } from "@/lib/admin/tenant-registry";
import type { PlatformTenant, TenantPlan, TenantStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/tenants/")({
  head: () => ({ meta: [{ title: "Tenants — Admin VendaPro" }] }),
  component: TenantsPage,
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

function statusVariant(status: TenantStatus): "default" | "secondary" | "destructive" {
  if (status === "active") return "default";
  if (status === "trial") return "secondary";
  return "destructive";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function TenantsPage() {
  const { tenants, createTenant, deleteTenant } = usePlatform();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PlatformTenant | null>(null);
  const [nome, setNome] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [plan, setPlan] = React.useState<TenantPlan>("starter");
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(nome));
    }
  }, [nome, slugTouched]);

  const handleCreate = () => {
    try {
      const tenant = createTenant({ nome, slug, plan, status: "trial" });
      toast.success(`Tenant "${tenant.nome}" criado.`);
      setCreateOpen(false);
      setNome("");
      setSlug("");
      setPlan("starter");
      setSlugTouched(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar tenant.");
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      deleteTenant(deleteTarget.id);
      toast.success(`Tenant "${deleteTarget.nome}" removido.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir tenant.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie empresas cadastradas na plataforma.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            {tenants.length} {tenants.length === 1 ? "empresa" : "empresas"}
          </CardTitle>
          <CardDescription>
            Clique em um tenant para editar configurações e white label.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/admin/tenants/$tenantId"
                      params={{ tenantId: tenant.id }}
                      className="hover:underline"
                    >
                      {tenant.nome}
                    </Link>
                    {tenant.isSystem && (
                      <Badge variant="outline" className="ml-2">
                        Sistema
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{tenant.slug}</code>
                  </TableCell>
                  <TableCell>{PLAN_LABELS[tenant.plan]}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(tenant.status)}>
                      {STATUS_LABELS[tenant.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tenant.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`/t/${tenant.slug}/app/painel`}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir app operacional"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      {!tenant.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(tenant)}
                          title="Excluir tenant"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo tenant</DialogTitle>
            <DialogDescription>
              Crie uma nova empresa na plataforma. O slug será usado na URL (
              <code className="text-xs">/t/slug/app</code>).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-nome">Nome da empresa</Label>
              <Input
                id="tenant-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Tech Solutions"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-slug">Slug</Label>
              <Input
                id="tenant-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="tech-solutions"
              />
            </div>
            <div className="space-y-2">
              <Label>Plano inicial</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as TenantPlan)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter — R$ 99/mês</SelectItem>
                  <SelectItem value="pro">Pro — R$ 299/mês</SelectItem>
                  <SelectItem value="enterprise">Enterprise — R$ 799/mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!nome.trim() || !slug.trim()}>
              Criar tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              O tenant <strong>{deleteTarget?.nome}</strong> será removido permanentemente. Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
