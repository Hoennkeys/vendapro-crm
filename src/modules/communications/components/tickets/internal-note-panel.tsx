import { useCommunications } from "../../store/communications-context";
import { canViewInternalNote, resolveAuthRole } from "../../domain/permissions";
import { useAuth } from "@/lib/auth/auth-store";
import { brDateTime } from "@/lib/format";

export function InternalNotePanel({ conversationId }: { conversationId: string }) {
  const { snapshot } = useCommunications();
  const { session } = useAuth();
  const role = resolveAuthRole(session);
  if (!role) return null;

  const notes = snapshot.internalNotes.filter(
    (n) => n.conversationId === conversationId && canViewInternalNote(role, n),
  );

  if (notes.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">Notas internas</p>
      {notes.map((n) => (
        <div key={n.id} className="rounded-md border border-amber-200 bg-amber-50/50 p-2 text-sm">
          <p>{n.body}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{brDateTime(n.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
