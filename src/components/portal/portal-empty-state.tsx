import type { LucideIcon } from "lucide-react";

type PortalEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function PortalEmptyState({ icon: Icon, title, description }: PortalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
