import { Badge } from "@/components/ui/badge";
import type { ParticipantRole } from "../../domain/entities";
import { labelCommunicationsRole } from "@/modules/creator/domain/terminology";

export function RoleBadge({ role }: { role: ParticipantRole }) {
  return <Badge variant="secondary">{labelCommunicationsRole(role)}</Badge>;
}
