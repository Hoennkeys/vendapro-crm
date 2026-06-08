import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Smartphone, Mail, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCrm } from "@/lib/crm-store";
import type { Papel } from "@/lib/types";
import { WhiteLabelSettings } from "@/components/tenant/white-label-settings";

export const Route = createFileRoute("/t/$tenantSlug/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — VendaPro CRM" }] }),
  component: Configuracoes,
});

function QrCodeSimulado() {
  // Simple SVG noise pattern as a faux QR code
  const cells = React.useMemo(() => {
    const arr: boolean[] = [];
    let seed = 7;
    for (let i = 0; i < 25 * 25; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      arr.push(seed / 233280 > 0.55);
    }
    return arr;
  }, []);
  return (
    <svg viewBox="0 0 25 25" className="h-48 w-48 rounded-md border bg-white p-2">
      {cells.map(
        (on, i) =>
          on && (
            <rect key={i} x={i % 25} y={Math.floor(i / 25)} width="1" height="1" fill="#0a0a0a" />
          ),
      )}
      {[
        [0, 0],
        [18, 0],
        [0, 18],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="7" height="7" fill="#0a0a0a" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0a0a0a" />
        </g>
      ))}
    </svg>
  );
}

function Configuracoes() {
  const { usuarios, adicionarUsuario, alternarUsuarioAtivo } = useCrm();
  const [novo, setNovo] = React.useState(false);
  const [form, setForm] = React.useState({
    nome: "",
    email: "",
    papel: "Vendedor" as Papel,
    ativo: true,
  });
  const [smtp, setSmtp] = React.useState({
    host: "",
    porta: "",
    usuario: "",
    senha: "",
    ssl: true,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações e Canais</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie usuários, permissões e integrações.
        </p>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">
            <Shield className="h-4 w-4 mr-1" /> Usuários e Permissões
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <Smartphone className="h-4 w-4 mr-1" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-1" /> E-mail (SMTP/IMAP)
          </TabsTrigger>
          <TabsTrigger value="whitelabel">
            <Palette className="h-4 w-4 mr-1" /> White Label
          </TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Equipe</CardTitle>
                <CardDescription>Defina quem é Administrador ou Vendedor.</CardDescription>
              </div>
              <Button onClick={() => setNovo(true)}>
                <Plus className="h-4 w-4" /> Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.papel === "Administrador" ? "default" : "secondary"}>
                          {u.papel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.ativo ? (
                          <Badge className="bg-emerald-600 text-white">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={u.ativo}
                          onCheckedChange={() => alternarUsuarioAtivo(u.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Conectar WhatsApp Business</CardTitle>
              <CardDescription>Escaneie o QR Code com seu WhatsApp para conectar.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <QrCodeSimulado />
              <div className="space-y-3 text-sm flex-1">
                <p className="font-medium">Como conectar:</p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Abra o WhatsApp no seu celular.</li>
                  <li>Toque em Configurações &gt; Aparelhos conectados.</li>
                  <li>
                    Toque em <strong>Conectar um aparelho</strong>.
                  </li>
                  <li>Aponte a câmera para o QR Code ao lado.</li>
                </ol>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Aguardando conexão...
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("QR Code atualizado!")}
                  >
                    Gerar novo QR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de E-mail (SMTP / IMAP)</CardTitle>
              <CardDescription>Conecte sua conta de e-mail corporativa.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium">SMTP (Envio)</h3>
                <div>
                  <Label>Servidor SMTP</Label>
                  <Input
                    value={smtp.host}
                    onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Porta</Label>
                  <Input
                    value={smtp.porta}
                    onChange={(e) => setSmtp({ ...smtp, porta: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Usuário</Label>
                  <Input
                    value={smtp.usuario}
                    onChange={(e) => setSmtp({ ...smtp, usuario: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={smtp.senha}
                    onChange={(e) => setSmtp({ ...smtp, senha: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={smtp.ssl}
                    onCheckedChange={(v) => setSmtp({ ...smtp, ssl: v })}
                  />
                  <Label>Usar SSL/TLS</Label>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">IMAP (Recebimento)</h3>
                <div>
                  <Label>Servidor IMAP</Label>
                  <Input placeholder="imap.seudominio.com.br" />
                </div>
                <div>
                  <Label>Porta</Label>
                  <Input placeholder="993" />
                </div>
                <div>
                  <Label>Usuário</Label>
                  <Input placeholder="seu@email.com.br" />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Label>Usar SSL/TLS</Label>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => toast.success("Configurações salvas!")}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelabel">
          <WhiteLabelSettings />
        </TabsContent>

        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Geral</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <div>
                <Label>Nome da empresa</Label>
                <Input placeholder="Sua empresa" />
              </div>
              <div>
                <Label>Fuso horário</Label>
                <Input placeholder="America/Sao_Paulo" />
              </div>
              <div>
                <Label>Moeda</Label>
                <Select defaultValue="BRL">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar (US$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => toast.success("Preferências salvas!")}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={novo} onOpenChange={setNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Adicione um membro à equipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Papel</Label>
              <Select
                value={form.papel}
                onValueChange={(v) => setForm({ ...form, papel: v as Papel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovo(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                adicionarUsuario(form);
                setNovo(false);
                setForm({ nome: "", email: "", papel: "Vendedor", ativo: true });
                toast.success("Usuário criado!");
              }}
              disabled={!form.nome || !form.email}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
