import { Badge } from "@/components/ui/badge";
import type { ParticipantRole } from "../../domain/entities";

const LABELS: Record<ParticipantRole, string> = {
  admin: "Admin",
  employee: "Funcionário",
  client: "Cliente",
  system: "Sistema",
  external: "Externo",
};

export function RoleBadge({ role }: { role: ParticipantRole }) {
  return <Badge variant="secondary">{LABELS[role] ?? role}</Badge>;
}
