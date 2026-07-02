import * as React from "react";
import { Send, Paperclip, Smile, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJIS = ["😀", "👍", "❤️", "🎉", "✅", "📎", "🙏", "💬"];

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onInternalNote?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
};

export function MessageComposer({
  value,
  onChange,
  onSend,
  onInternalNote,
  disabled,
  placeholder = "Digite uma mensagem...",
  multiline = false,
}: Props) {
  const [noteMode, setNoteMode] = React.useState(false);

  const submit = () => {
    if (!value.trim()) return;
    if (noteMode && onInternalNote) {
      onInternalNote(value.trim());
      onChange("");
      setNoteMode(false);
      return;
    }
    onSend();
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="p-3 border-t bg-background space-y-2">
      {noteMode && (
        <p className="text-xs text-amber-600 font-medium">Modo nota interna — visível só para equipe</p>
      )}
      <div className="flex items-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className="text-lg hover:scale-110 transition-transform"
                onClick={() => onChange(value + e)}
              >
                {e}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        {onInternalNote && (
          <Button
            variant={noteMode ? "secondary" : "ghost"}
            size="icon"
            type="button"
            onClick={() => setNoteMode(!noteMode)}
            title="Nota interna"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
        )}
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !multiline) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={noteMode ? "Nota interna..." : placeholder}
          disabled={disabled}
          className={multiline ? "min-h-[80px]" : undefined}
        />
        <Button onClick={submit} disabled={disabled || !value.trim()} type="button">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
