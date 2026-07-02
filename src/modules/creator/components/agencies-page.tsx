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

const STATUS_LABEL = { active: "Ativa", inactive: "Inativa" } as const;

export function AgenciesPage() {
  const { agencies, brands } = useCreator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agencies</h1>
        <p className="text-sm text-muted-foreground">
          Parceiros que representam creators e gerenciam negociações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agencies parceiras</CardTitle>
        </CardHeader>
        <CardContent>
          {agencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma agency cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Marcas</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <p className="text-sm">{a.contactName}</p>
                      <p className="text-xs text-muted-foreground">{a.contactEmail}</p>
                    </TableCell>
                    <TableCell>
                      {a.brandsManaged
                        .map((id) => brands.find((b) => b.id === id)?.name ?? id)
                        .join(", ") || "—"}
                    </TableCell>
                    <TableCell>{a.commissionRate}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS_LABEL[a.status]}</Badge>
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
