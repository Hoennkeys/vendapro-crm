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

const STATUS_LABEL = {
  prospect: "Prospect",
  active: "Ativo",
  inactive: "Inativo",
} as const;

export function SponsorsPage() {
  const { sponsors } = useCreator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sponsors</h1>
        <p className="text-sm text-muted-foreground">
          Marcas patrocinadoras e budgets disponíveis para campanhas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline de sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum sponsor cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Indústria</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsors.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.industry}</TableCell>
                    <TableCell>{s.budgetRange}</TableCell>
                    <TableCell className="text-muted-foreground">{s.contactEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{STATUS_LABEL[s.status]}</Badge>
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
