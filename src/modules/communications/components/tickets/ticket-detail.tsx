import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-store";
import { useCommunications } from "../../store/communications-context";
import type { Ticket, TicketStatus } from "../../domain/entities";
import { brDateTime } from "@/lib/format";
import { InternalNotePanel } from "./internal-note-panel";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

export function TicketDetail({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket;
  onStatusChange: (s: TicketStatus) => void;
}) {
  const { hub } = useCommunications();
  const { session } = useAuth();
  const [note, setNote] = React.useState("");

  const addNote = () => {
    if (!note.trim() || !session?.user.id) return;
    const convId = ticket.conversationId ?? `conv_ticket_${ticket.id}`;
    hub.addInternalNote({
      conversationId: convId,
      ticketId: ticket.id,
      authorId: session.user.id,
      body: note.trim(),
    });
    setNote("");
    toast.success("Nota interna registrada");
  };

  return (
    <CardContent className="space-y-4 pt-6">
      <div>
        <h2 className="text-lg font-semibold">{ticket.title}</h2>
        <p className="text-sm text-muted-foreground">{brDateTime(ticket.createdAt)}</p>
      </div>
      <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
      <div className="flex flex-wrap gap-2">
        {(["open", "in_progress", "resolved", "closed"] as TicketStatus[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={ticket.status === s ? "default" : "outline"}
            onClick={() => onStatusChange(s)}
          >
            {STATUS_LABEL[s]}
          </Button>
        ))}
      </div>
      <InternalNotePanel conversationId={ticket.conversationId ?? `conv_ticket_${ticket.id}`} />
      <div className="space-y-2 border-t pt-4">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Adicionar nota interna..."
          rows={3}
        />
        <Button size="sm" onClick={addNote} disabled={!note.trim()}>
          Salvar nota
        </Button>
      </div>
    </CardContent>
  );
}
