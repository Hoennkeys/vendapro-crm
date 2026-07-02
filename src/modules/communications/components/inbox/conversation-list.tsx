import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { brTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "../../domain/entities";
import { UnreadBadge } from "./unread-badge";
import { channelIcon } from "./channel-filter-bar";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function displayName(c: Conversation) {
  return c.subject ?? c.participants.find((p) => p.role === "client")?.name ?? "Conversa";
}

type Props = {
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  activeId?: string;
  onSelect: (id: string) => void;
};

export function ConversationList({ conversations, messagesByConv, activeId, onSelect }: Props) {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  return (
    <ScrollArea className="flex-1">
      {sorted.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
      )}
      {sorted.map((c) => {
        const msgs = messagesByConv[c.id] ?? [];
        const last = msgs[msgs.length - 1];
        const Icon = channelIcon(c.channelType);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "w-full text-left p-3 border-b hover:bg-accent/50 flex gap-3 items-start transition-colors",
              activeId === c.id && "bg-accent",
            )}
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {iniciais(displayName(c))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <p className="text-sm font-medium truncate">{displayName(c)}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {last ? brTime(last.sentAt) : brTime(c.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="h-3 w-3" />
                <span className="capitalize">{c.channelType}</span>
              </div>
              <p className="text-xs truncate text-muted-foreground">{last?.body ?? ""}</p>
            </div>
            <UnreadBadge count={c.unreadCount} />
          </button>
        );
      })}
    </ScrollArea>
  );
}
