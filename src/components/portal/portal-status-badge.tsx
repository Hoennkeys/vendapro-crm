import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Pendente: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Aceita: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Vencida: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Aberto: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "Em andamento": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  Resolvido: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Fechado: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Paga: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Cancelada: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Briefing: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Em execução": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  Revisão: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Entregue: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

type PortalStatusBadgeProps = {
  status: string;
  className?: string;
};

export function PortalStatusBadge({ status, className }: PortalStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={cn(STATUS_COLORS[status] ?? "", className)}>
      {status}
    </Badge>
  );
}
