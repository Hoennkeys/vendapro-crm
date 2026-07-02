import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Megaphone,
  MessageSquare,
  Receipt,
  Building2,
} from "lucide-react";

const CREATOR_FEATURES = [
  { label: "Comunicação", icon: MessageSquare },
  { label: "Campanhas", icon: Megaphone },
  { label: "Marcas", icon: Building2 },
  { label: "Calendário", icon: CalendarDays },
  { label: "Financeiro", icon: Receipt },
] as const;

const PIPELINE_STEPS = [
  { label: "Briefing", value: 28, weightClass: "text-foreground/60 font-semibold" },
  { label: "Proposta", value: 19, weightClass: "text-foreground/75 font-bold" },
  { label: "Negociação", value: 12, weightClass: "text-foreground/90 font-bold" },
  { label: "Produção", value: 7, weightClass: "text-foreground font-extrabold" },
  { label: "Parceria", value: 4, weightClass: "text-primary font-black" },
] as const;

const CHART_HEIGHT = 200;
const CHART_WIDTH = 500;

export function LoginPipelinePanel() {
  const totalSteps = PIPELINE_STEPS.length;

  const points = PIPELINE_STEPS.map((step, index) => {
    const x = (index / (totalSteps - 1)) * CHART_WIDTH;
    const progressRatio = index / (totalSteps - 1);
    const targetHeight = CHART_HEIGHT - 70;
    const y = CHART_HEIGHT - progressRatio * targetHeight - 25;

    return {
      x,
      y,
      label: step.label,
      value: step.value,
      weightClass: step.weightClass,
      isFinalObjective: index === totalSteps - 1,
    };
  });

  return (
    <div className="flex h-full flex-col justify-center px-12 py-16 xl:px-20">
      <div className="mx-auto w-full max-w-xl space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Creator Operating System
          </p>
          <h2 className="text-4xl leading-tight font-semibold tracking-tight text-balance">
            Sua operação profissional,{" "}
            <span className="text-primary">centralizada.</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Gerencie marcas, campanhas e parcerias em um único lugar — do primeiro contato à entrega
            final.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {CREATOR_FEATURES.map(({ label, icon: Icon }) => (
              <Badge
                key={label}
                variant="outline"
                className="gap-1.5 border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium"
              >
                <Icon className="h-3 w-3 text-primary" />
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative space-y-6 overflow-hidden rounded-xl border border-sidebar-border bg-background/40 p-6 shadow-2xl backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.002)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px]" />

          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
              Pipeline de Parcerias
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-primary">LIVE</span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </div>
          </div>

          <div className="relative z-10 w-full" style={{ height: CHART_HEIGHT }}>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="objectiveGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="2" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {points.map((pt, i) => (
                <g key={`tactical-grid-${i}`} className="opacity-15">
                  <line
                    x1={pt.x}
                    y1={0}
                    x2={pt.x}
                    y2={CHART_HEIGHT}
                    className="stroke-primary"
                    strokeDasharray="1 5"
                  />
                  <line
                    x1={0}
                    y1={pt.y}
                    x2={CHART_WIDTH}
                    y2={pt.y}
                    className="stroke-primary"
                    strokeDasharray="1 5"
                  />
                </g>
              ))}

              {points.map((pt, i) => {
                if (i === points.length - 1) return null;
                const nextPt = points[i + 1];
                return (
                  <g key={`link-${i}`}>
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={nextPt.x}
                      y2={nextPt.y}
                      className="stroke-primary/20"
                      strokeWidth="1"
                    />
                    <line
                      x1={pt.x}
                      y1={pt.y}
                      x2={nextPt.x}
                      y2={nextPt.y}
                      className="stroke-primary/50"
                      strokeWidth="1.5"
                      strokeDasharray="4 8"
                    />
                  </g>
                );
              })}

              {points.map((pt, i) => {
                if (pt.isFinalObjective) {
                  return (
                    <g key={`node-${i}`} className="cursor-pointer" filter="url(#objectiveGlow)">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        className="animate-[spin_8s_linear_infinite] fill-none stroke-primary/30"
                        strokeDasharray="4 4"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="10"
                        className="animate-pulse fill-none stroke-primary"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        className="fill-primary stroke-background"
                        strokeWidth="2"
                      />
                    </g>
                  );
                }

                return (
                  <g key={`node-${i}`} filter="url(#nodeGlow)">
                    <line
                      x1={pt.x}
                      y1={pt.y + 8}
                      x2={pt.x}
                      y2={CHART_HEIGHT}
                      className="stroke-primary/30"
                      strokeDasharray="2 2"
                    />
                    <rect
                      x={pt.x - 6}
                      y={pt.y - 6}
                      width="12"
                      height="12"
                      rx="2"
                      className="fill-background stroke-primary/70"
                      strokeWidth="1.5"
                    />
                    <circle cx={pt.x} cy={pt.y} r="2" className="fill-primary" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-5 gap-2.5 pt-2">
            {points.map((pt) => (
              <div
                key={pt.label}
                className={`flex min-w-0 flex-col items-center justify-between rounded-lg border p-2 text-center transition-all ${
                  pt.isFinalObjective
                    ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                    : "border-sidebar-border/50 bg-background/40"
                }`}
              >
                <p
                  className={`w-full truncate text-[11px] font-mono tracking-tighter uppercase ${
                    pt.isFinalObjective ? "font-bold text-primary" : "text-muted-foreground/80"
                  }`}
                >
                  {pt.isFinalObjective ? "Parceria" : pt.label}
                </p>
                <div
                  className={`mt-3 whitespace-nowrap text-base tabular-nums tracking-tight ${pt.weightClass} ${
                    pt.isFinalObjective ? "animate-pulse text-lg" : ""
                  }`}
                >
                  {pt.value}
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 grid gap-3 border-t border-sidebar-border/60 pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
            <p className="text-base text-muted-foreground">
              <span className="font-semibold text-foreground">R$ 141k</span> em campanhas ativas
            </p>
            <p className="text-base text-muted-foreground">
              <span className="font-semibold text-foreground">52</span>{" "}
              <span className="text-muted-foreground/80">oportunidades</span>
            </p>
            <Badge
              variant="outline"
              className="w-fit border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success backdrop-blur-sm"
            >
              +28% vs mês anterior
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
