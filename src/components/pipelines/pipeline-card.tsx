import type { MutableRefObject } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl, brDate } from "@/lib/format";
import type { CardField, PipelineItem } from "@/lib/pipelines/types";
import type { Prioridade } from "@/lib/types";
import { cn } from "@/lib/utils";

const corPrioridade: Record<Prioridade, string> = {
  Alta: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Média: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Baixa: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function formatFieldValue(field: CardField, value: unknown): string {
  if (value == null || value === "") return "—";
  if (field.type === "currency") return brl(Number(value));
  if (field.type === "date") return brDate(String(value));
  return String(value);
}

type PipelineCardProps = {
  item: PipelineItem;
  cardSchema: CardField[];
  onClick: () => void;
  suppressClickRef?: MutableRefObject<boolean>;
};

export function PipelineCard({ item, cardSchema, onClick, suppressClickRef }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const cardFields = cardSchema.filter((f) => f.showOnCard);
  const prioridade = item.dados.prioridade as Prioridade | undefined;

  const handleClick = () => {
    if (suppressClickRef?.current) {
      suppressClickRef.current = false;
      return;
    }
    onClick();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-30",
      )}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{item.titulo}</p>
          {prioridade && (
            <Badge variant="secondary" className={cn("text-[10px]", corPrioridade[prioridade])}>
              {prioridade}
            </Badge>
          )}
        </div>
        {cardFields
          .filter((f) => f.key !== "prioridade")
          .map((field) => (
            <p key={field.key} className="text-xs text-muted-foreground">
              {field.type === "currency" ? (
                <span className="text-sm font-semibold text-primary">
                  {formatFieldValue(field, item.dados[field.key])}
                </span>
              ) : (
                formatFieldValue(field, item.dados[field.key])
              )}
            </p>
          ))}
        <div className="flex items-center justify-end">
          <span className="text-[11px] text-muted-foreground">{brDate(item.criadoEm)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
