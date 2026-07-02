import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreator } from "../store/creator-context";

const STATUS_LABEL = { active: "Ativa", paused: "Pausada", archived: "Arquivada" } as const;

function formatAudience(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export function BrandsPage() {
  const { brands, agencies } = useCreator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marcas</h1>
        <p className="text-sm text-muted-foreground">
          Perfis de creator e propriedades de conteúdo gerenciados no tenant.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas as marcas</CardTitle>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nicho</TableHead>
                  <TableHead>Audiência</TableHead>
                  <TableHead>Plataformas</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((b) => {
                  const agency = agencies.find((a) => a.id === b.primaryAgencyId);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.niche}</TableCell>
                      <TableCell>{formatAudience(b.audienceSize)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {b.platforms.map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{agency?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{STATUS_LABEL[b.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
