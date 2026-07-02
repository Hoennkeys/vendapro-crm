import {
  MessageSquare,
  Mail,
  Smartphone,
  Hash,
  MessageCircle,
  Send,
  Gamepad2,
  Users,
} from "lucide-react";
import type { CommunicationChannelType } from "../../domain/entities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHANNELS: { type: CommunicationChannelType | "all"; label: string; icon: typeof MessageSquare }[] = [
  { type: "all", label: "Todos", icon: MessageSquare },
  { type: "internal", label: "Chat", icon: MessageSquare },
  { type: "email", label: "E-mail", icon: Mail },
  { type: "whatsapp", label: "WhatsApp", icon: Smartphone },
  { type: "slack", label: "Slack", icon: Hash },
  { type: "crisp", label: "Crisp", icon: MessageCircle },
  { type: "telegram", label: "Telegram", icon: Send },
  { type: "discord", label: "Discord", icon: Gamepad2 },
  { type: "teams", label: "Teams", icon: Users },
];

export function ChannelFilterBar({
  value,
  onChange,
}: {
  value: CommunicationChannelType | "all";
  onChange: (v: CommunicationChannelType | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b">
      {CHANNELS.map((ch) => (
        <Button
          key={ch.type}
          variant={value === ch.type ? "default" : "outline"}
          size="sm"
          className={cn("h-7 text-xs gap-1", value === ch.type && "shadow-sm")}
          onClick={() => onChange(ch.type)}
        >
          <ch.icon className="h-3 w-3" />
          {ch.label}
        </Button>
      ))}
    </div>
  );
}

export function channelIcon(type: CommunicationChannelType) {
  return CHANNELS.find((c) => c.type === type)?.icon ?? MessageSquare;
}
