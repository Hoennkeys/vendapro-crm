import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ProviderConfig } from "../../domain/entities";

const CREDENTIAL_FIELDS: Record<string, { key: string; label: string }[]> = {
  whatsapp: [
    { key: "accessToken", label: "Access Token" },
    { key: "phoneNumberId", label: "Phone Number ID" },
    { key: "webhookVerifyToken", label: "Webhook Verify Token" },
  ],
  slack: [
    { key: "botToken", label: "Bot Token" },
    { key: "signingSecret", label: "Signing Secret" },
  ],
  crisp: [
    { key: "websiteId", label: "Website ID" },
    { key: "identifier", label: "Identifier" },
    { key: "key", label: "Key" },
  ],
  email: [
    { key: "smtpHost", label: "SMTP Host" },
    { key: "smtpPorta", label: "SMTP Porta" },
    { key: "smtpUsuario", label: "SMTP Usuário" },
  ],
};

type Props = {
  provider: ProviderConfig;
  onChange: (patch: Partial<ProviderConfig>) => void;
};

export function ProviderConfigForm({ provider, onChange }: Props) {
  const fields = CREDENTIAL_FIELDS[provider.type] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={`enabled-${provider.id}`}>Ativo</Label>
        <Switch
          id={`enabled-${provider.id}`}
          checked={provider.enabled}
          onCheckedChange={(enabled) => onChange({ enabled })}
        />
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <Label>{f.label}</Label>
          <Input
            type={f.key.toLowerCase().includes("token") || f.key === "key" ? "password" : "text"}
            value={provider.credentials[f.key] ?? ""}
            onChange={(e) =>
              onChange({
                credentials: { ...provider.credentials, [f.key]: e.target.value },
              })
            }
          />
        </div>
      ))}
      <div>
        <Label>Webhook URL</Label>
        <Input
          value={provider.webhookUrl ?? ""}
          onChange={(e) => onChange({ webhookUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
