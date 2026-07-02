import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CampaignStatus } from "../domain/entities";
import { useCreator } from "../store/creator-context";
import { brl } from "@/lib/format";

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
};

export function CampaignsPage() {
  const { campaigns, brands, sponsors, agencies, atualizarCampaignStatus } = useCreator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
        <p className="text-sm text-muted-foreground">
          Ativações patrocinadas conectadas a marcas, sponsors e Communications Hub.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todas as campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma campanha cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium">{c.title}</p>
                      {c.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>{brands.find((b) => b.id === c.brandId)?.name ?? "—"}</TableCell>
                    <TableCell>{sponsors.find((s) => s.id === c.sponsorId)?.name ?? "—"}</TableCell>
                    <TableCell>{brl(c.budget)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS_LABEL[c.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarCampaignStatus(c.id, "active")}
                        >
                          Ativar
                        </Button>
                      ) : c.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => atualizarCampaignStatus(c.id, "paused")}
                        >
                          Pausar
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
