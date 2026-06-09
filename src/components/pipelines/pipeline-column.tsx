import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import type { PipelineStage } from "@/lib/pipelines/types";
import { cn } from "@/lib/utils";

type PipelineColumnProps = {
  stage: PipelineStage;
  total?: number;
  qtd: number;
  children: ReactNode;
};

export function PipelineColumn({ stage, total, qtd, children }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border bg-muted/30 p-3 transition-colors",
        isOver && "bg-accent/50 ring-2 ring-primary",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", stage.cor)} />
          <span className="text-sm font-semibold">{stage.label}</span>
          <Badge variant="secondary" className="text-xs">
            {qtd}
          </Badge>
        </div>
      </div>
      {total != null && <p className="mb-2 text-xs text-muted-foreground">{brl(total)}</p>}
      <div className="flex min-h-[120px] flex-col gap-2">{children}</div>
    </div>
  );
}
