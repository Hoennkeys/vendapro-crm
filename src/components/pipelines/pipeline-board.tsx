import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { PipelineCard } from "./pipeline-card";
import { PipelineColumn } from "./pipeline-column";
import type { PipelineDefinition, PipelineItem } from "@/lib/pipelines/types";

type PipelineBoardProps = {
  pipeline: PipelineDefinition;
  items: PipelineItem[];
  onMoveItem: (itemId: string, stageId: string) => void;
  onItemClick?: (item: PipelineItem) => void;
  getStageTotal?: (stageId: string, stageItems: PipelineItem[]) => number | undefined;
};

export function PipelineBoard({
  pipeline,
  items,
  onMoveItem,
  onItemClick,
  getStageTotal,
}: PipelineBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const suppressClickRef = React.useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const stageIds = new Set(pipeline.stages.map((s) => s.id));
  const sortedStages = [...pipeline.stages].sort((a, b) => a.ordem - b.ordem);

  const handleEnd = (e: DragEndEvent) => {
    const id = e.active.id as string;
    const overId = e.over?.id as string | undefined;
    setActiveId(null);
    if (!overId || !stageIds.has(overId)) return;

    const item = items.find((i) => i.id === id);
    if (item?.stageId === overId) return;

    suppressClickRef.current = true;
    onMoveItem(id, overId);
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;
  const gridClass =
    sortedStages.length >= 5
      ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
      : sortedStages.length === 4
        ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        : "grid grid-cols-1 gap-4 md:grid-cols-2";

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className={gridClass}>
        {sortedStages.map((stage) => {
          const stageItems = items.filter((i) => i.stageId === stage.id);
          const total = getStageTotal?.(stage.id, stageItems);
          return (
            <PipelineColumn key={stage.id} stage={stage} total={total} qtd={stageItems.length}>
              {stageItems.map((item) => (
                <PipelineCard
                  key={item.id}
                  item={item}
                  cardSchema={pipeline.cardSchema}
                  suppressClickRef={suppressClickRef}
                  onClick={() => onItemClick?.(item)}
                />
              ))}
            </PipelineColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="opacity-90">
            <PipelineCard item={activeItem} cardSchema={pipeline.cardSchema} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
