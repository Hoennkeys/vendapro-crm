import * as React from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Plus, Trash2, Link2, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrm } from "@/lib/crm-store";
import { resolveClientId } from "@/lib/clients-registry";
import { brl, brDate } from "@/lib/format";
import { useTenant } from "@/lib/tenant/tenant-store";
import type { ItemProposta, Proposta, StatusProposta } from "@/lib/types";
import { cn } from "@/lib/utils";

const corStatus: Record<StatusProposta, string> = {
  Pendente: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Aceita: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Vencida: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export type PropostaGeneratorProps = {
  /** Pré-preenche campos a partir do lead vinculado. */
  leadId?: string;
  /** Layout compacto para uso em drawer/modal dentro do funil. */
  embedded?: boolean;
  /** Callback após criação bem-sucedida da proposta. */
  onCreated?: (proposta: Pick<Proposta, "id" | "numero">) => void;
};

export function PropostaGenerator({ leadId, embedded = false, onCreated }: PropostaGeneratorProps) {
  const { propostas, leads, adicionarProposta, atualizarStatusProposta, usuarios } = useCrm();
  const { whiteLabel } = useTenant();

  const [cliente, setCliente] = React.useState("");
  const [cnpj, setCnpj] = React.useState("");
  const [validadeDias, setValidadeDias] = React.useState(15);
  const [condicoes, setCondicoes] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [itens, setItens] = React.useState<ItemProposta[]>([
    { descricao: "", qtd: 1, valorUnit: 0 },
  ]);

  React.useEffect(() => {
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setCliente(lead.cliente);
    if (lead.valor > 0) {
      setItens([{ descricao: lead.cliente, qtd: 1, valorUnit: lead.valor }]);
    }
  }, [leadId, leads]);

  const total = itens.reduce((a, i) => a + i.qtd * i.valorUnit, 0);

  const atualizarItem = (i: number, patch: Partial<ItemProposta>) => {
    setItens((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };

  const gerarPdf = (p: Partial<Proposta>) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Proposta Comercial — VendaPro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Cliente: ${p.cliente ?? cliente}`, 14, 28);
    doc.text(`CNPJ: ${p.cnpj ?? cnpj}`, 14, 34);
    doc.text(`Número: ${p.numero ?? "—"}`, 14, 40);
    doc.text(
      `Validade: ${brDate(p.validade ?? new Date(Date.now() + validadeDias * 86400000))}`,
      14,
      46,
    );

    autoTable(doc, {
      startY: 54,
      head: [["Descrição", "Qtd.", "Valor Unit.", "Total"]],
      body: (p.itens ?? itens).map((i) => [
        i.descricao,
        String(i.qtd),
        brl(i.valorUnit),
        brl(i.qtd * i.valorUnit),
      ]),
      foot: [["", "", "Total geral", brl(p.valor ?? total)]],
      headStyles: { fillColor: [99, 102, 241] },
      footStyles: { fillColor: [240, 240, 245], textColor: 20 },
    });
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.text(`Condições: ${p.condicoes ?? condicoes}`, 14, finalY);
    if (p.observacoes ?? observacoes)
      doc.text(`Observações: ${p.observacoes ?? observacoes}`, 14, finalY + 6);
    doc.setFontSize(8);
    doc.text("VendaPro CRM · vendapro.com.br", 14, 285);
    doc.save(`${p.numero ?? "proposta"}.pdf`);
  };

  const salvar = () => {
    if (!cliente) return toast.error("Informe o cliente.");
    if (itens.length === 0 || !itens.some((i) => i.descricao.trim())) {
      return toast.error("Adicione ao menos um item com descrição.");
    }
    const validade = new Date(Date.now() + validadeDias * 86400000).toISOString();
    const lead = leadId ? leads.find((l) => l.id === leadId) : undefined;
    const nova = adicionarProposta({
      tenantId: whiteLabel.tenantId,
      clientId:
        lead?.clientId ?? resolveClientId({ tenantId: whiteLabel.tenantId, cliente, cnpj }),
      cliente,
      cnpj,
      valor: total,
      validade,
      responsavelId: lead?.responsavelId ?? usuarios[0]?.id ?? "",
      itens,
      condicoes,
      observacoes,
      leadId,
    });
    toast.success(`Proposta ${nova.numero} criada!`);
    onCreated?.({ id: nova.id, numero: nova.numero });
  };

  const copiarLink = () => {
    const url = `https://vendapro.com.br/propostas/${cliente.toLowerCase().replace(/\s+/g, "-") || "nova"}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success("Link copiado!", { description: url });
  };

  const propostasFiltradas = leadId ? propostas.filter((p) => p.leadId === leadId) : propostas;

  return (
    <div className={cn("space-y-6", embedded && "space-y-4")}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gerador de Propostas</h1>
          <p className="text-sm text-muted-foreground">
            Crie propostas comerciais profissionais em PDF.
          </p>
        </div>
      )}

      <div className={cn("grid grid-cols-1 gap-4", !embedded && "lg:grid-cols-3")}>
        <Card className={cn(!embedded && "lg:col-span-2")}>
          <CardHeader>
            <CardTitle>{embedded ? "Nova Proposta" : "Dados da Proposta"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cliente</Label>
                <Input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Padaria São João"
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <Label>Validade (dias)</Label>
                <Input
                  type="number"
                  value={validadeDias}
                  onChange={(e) => setValidadeDias(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Condições</Label>
                <Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Itens</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItens([...itens, { descricao: "", qtd: 1, valorUnit: 0 }])}
                >
                  <Plus className="h-3 w-3" /> Item
                </Button>
              </div>
              <div className="space-y-2">
                {itens.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <Input
                        value={it.descricao}
                        onChange={(e) => atualizarItem(i, { descricao: e.target.value })}
                        placeholder="Descrição"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={it.qtd}
                        onChange={(e) => atualizarItem(i, { qtd: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={it.valorUnit}
                        onChange={(e) => atualizarItem(i, { valorUnit: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setItens(itens.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              <Button variant="outline" onClick={copiarLink}>
                <Link2 className="h-4 w-4" /> Gerar link compartilhável
              </Button>
              <Button variant="outline" onClick={() => gerarPdf({})}>
                <Download className="h-4 w-4" /> Baixar PDF
              </Button>
              <Button onClick={salvar}>
                <FileText className="h-4 w-4" /> Salvar Proposta
              </Button>
            </div>
          </CardContent>
        </Card>

        {!embedded && (
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="rounded-md border p-4 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold text-primary">VendaPro</span>
                  <span className="text-xs text-muted-foreground">Proposta Comercial</span>
                </div>
                <p className="font-medium">{cliente || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">{cnpj || "CNPJ"}</p>
                <div className="space-y-1 mt-2">
                  {itens.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>
                        {i.descricao || "Item"} × {i.qtd}
                      </span>
                      <span>{brl(i.qtd * i.valorUnit)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{brl(total)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Validade: {validadeDias} dias · {condicoes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!embedded && (
        <Card>
          <CardHeader>
            <CardTitle>Propostas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propostasFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      Nenhuma proposta salva. Preencha o formulário acima para criar a primeira.
                    </TableCell>
                  </TableRow>
                )}
                {propostasFiltradas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                    <TableCell className="font-medium">{p.cliente}</TableCell>
                    <TableCell>{brl(p.valor)}</TableCell>
                    <TableCell>{brDate(p.criadaEm)}</TableCell>
                    <TableCell>{brDate(p.validade)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(corStatus[p.status])}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Select
                          value={p.status}
                          onValueChange={(v) => atualizarStatusProposta(p.id, v as StatusProposta)}
                        >
                          <SelectTrigger className="h-8 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["Pendente", "Aceita", "Vencida"] as StatusProposta[]).map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => gerarPdf(p)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
