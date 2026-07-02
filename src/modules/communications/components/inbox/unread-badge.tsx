import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <Badge className={cn("bg-emerald-600 text-white text-[10px] h-5 min-w-5", className)}>
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
