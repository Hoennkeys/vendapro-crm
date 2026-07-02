import { CheckCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { brTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "../../domain/entities";

type Props = {
  conversation: Conversation;
  messages: Message[];
};

export function ConversationThread({ conversation, messages }: Props) {
  const isEmail = conversation.channelType === "email";

  return (
    <ScrollArea className="flex-1 p-4">
      {isEmail && messages[0]?.metadata?.assunto && (
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-lg font-semibold">{String(messages[0].metadata.assunto)}</h2>
          <p className="text-sm text-muted-foreground">De: {messages[0].authorId}</p>
          {messages[0].metadata.para && (
            <p className="text-sm text-muted-foreground">Para: {String(messages[0].metadata.para)}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        {messages.map((m) => {
          if (m.isInternalNote) {
            return (
              <div key={m.id} className="flex justify-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 max-w-[90%] whitespace-pre-wrap">
                  Nota interna: {m.body}
                </Badge>
              </div>
            );
          }
          const isAgent = m.authorRole === "employee" || m.authorRole === "admin";
          return (
            <div key={m.id} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  isAgent
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-background border rounded-bl-sm",
                  isEmail && "max-w-full w-full rounded-lg",
                )}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[10px]",
                    isAgent ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  <span>{brTime(m.sentAt)}</span>
                  {isAgent && !isEmail && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
