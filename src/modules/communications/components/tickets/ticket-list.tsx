import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTicketsQuery, useUpdateTicketStatusMutation } from "../../hooks/use-tickets";
import type { Ticket, TicketStatus } from "../../domain/entities";
import { TicketDetail } from "./ticket-detail";
import { brDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

export function TicketListPage() {
  const { data: tickets = [] } = useTicketsQuery();
  const updateStatus = useUpdateTicketStatusMutation();
  const [selectedId, setSelectedId] = React.useState<string | undefined>();

  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div className="grid grid-cols-12 gap-4 h-full min-h-0">
      <Card className="col-span-12 md:col-span-5 flex flex-col min-h-0 p-0 overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Tickets</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={cn(
                "w-full text-left p-3 border-b hover:bg-accent/50",
                selectedId === t.id && "bg-accent",
              )}
            >
              <div className="flex justify-between gap-2">
                <p className="font-medium text-sm truncate">{t.title}</p>
                <Badge variant="outline">{STATUS_LABEL[t.status]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{t.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{brDateTime(t.updatedAt)}</p>
            </button>
          ))}
        </ScrollArea>
      </Card>
      <Card className="col-span-12 md:col-span-7 flex flex-col min-h-0">
        {selected ? (
          <TicketDetail
            ticket={selected}
            onStatusChange={(status) => updateStatus.mutate({ ticketId: selected.id, status })}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6">
            Selecione um ticket
          </div>
        )}
      </Card>
    </div>
  );
}

export type { Ticket };
