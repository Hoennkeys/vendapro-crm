import { FileText } from "lucide-react";

export function AttachmentPreview({ name, size }: { name: string; size?: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="truncate flex-1">{name}</span>
      {size != null && (
        <span className="text-xs text-muted-foreground">{Math.round(size / 1024)} KB</span>
      )}
    </div>
  );
}
