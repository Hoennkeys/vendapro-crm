import * as React from "react";
import { toast } from "sonner";
import { Palette, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEME_COLOR_PRESETS } from "@/lib/tenant/defaults";
import { useTenant } from "@/lib/tenant/tenant-store";
import { CREATOR_TERMS } from "@/modules/creator/domain/terminology";

export function WhiteLabelSettings() {
  const { whiteLabel, updateWhiteLabel, updateThemeColors, resetWhiteLabel } = useTenant();
  const [draft, setDraft] = React.useState(whiteLabel);

  React.useEffect(() => {
    setDraft(whiteLabel);
  }, [whiteLabel]);

  const handleSave = () => {
    updateWhiteLabel(draft);
    toast.success("White label salvo! Veja as mudanças no portal do cliente.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          White Label
        </CardTitle>
        <CardDescription>
          Personalize nome, logo e cores exibidos no portal do cliente (
          <code className="text-xs">/t/{whiteLabel.slug}/portal</code>).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wl-nome">Nome da empresa</Label>
            <Input
              id="wl-nome"
              value={draft.nome}
              onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-logo">URL do logo</Label>
            <Input
              id="wl-logo"
              value={draft.logoUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value || undefined })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-favicon">URL do favicon</Label>
            <Input
              id="wl-favicon"
              value={draft.faviconUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, faviconUrl: e.target.value || undefined })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-primary">Cor primária (oklch)</Label>
            <Input
              id="wl-primary"
              value={draft.cores.primary}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  cores: { ...draft.cores, primary: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-primary-fg">Texto sobre primária (oklch)</Label>
            <Input
              id="wl-primary-fg"
              value={draft.cores.primaryForeground}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  cores: { ...draft.cores, primaryForeground: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-accent">Cor de destaque (oklch)</Label>
            <Input
              id="wl-accent"
              value={draft.cores.accent ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  cores: { ...draft.cores, accent: e.target.value || undefined },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Presets de cor</Label>
          <div className="flex flex-wrap gap-2">
            {THEME_COLOR_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, cores: { ...preset.cores } }));
                  updateThemeColors(preset.cores);
                  toast.success(`Preset "${preset.label}" aplicado.`);
                }}
              >
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ background: preset.cores.primary }}
                />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Pré-visualização</p>
          <div className="flex items-center gap-3">
            {draft.logoUrl ? (
              <img
                src={draft.logoUrl}
                alt={draft.nome}
                className="h-10 w-10 rounded-md border object-contain"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-semibold"
                style={{
                  background: draft.cores.primary,
                  color: draft.cores.primaryForeground,
                }}
              >
                {draft.nome.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{draft.nome}</p>
              <p className="text-xs text-muted-foreground">{CREATOR_TERMS.portal}</p>
            </div>
            <Button
              className="ml-auto"
              style={{
                background: draft.cores.primary,
                color: draft.cores.primaryForeground,
              }}
            >
              Botão primário
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetWhiteLabel();
              toast.success("White label restaurado para o padrão.");
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar white label
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
