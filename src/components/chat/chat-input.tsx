"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_LENGTH = 500;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !disabled && !isSending;

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + "px"; // max 3 lines ~96px
  };

  const handleSend = async () => {
    if (!canSend) return;

    const content = trimmed;
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsSending(true);
    try {
      await onSend(content);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white px-3 py-2 safe-bottom">
      <div className="mx-auto flex max-w-lg items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "메시지를 보낼 수 없어요" : "메시지를 입력하세요"}
            disabled={disabled}
            maxLength={MAX_LENGTH}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border bg-muted px-4 py-2.5 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:bg-white",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
          {trimmed.length > 400 && (
            <span
              className={cn(
                "absolute bottom-1 right-3 text-[10px]",
                trimmed.length > 480 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {trimmed.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!canSend}
          className="mb-0.5 h-9 w-9 shrink-0 rounded-full p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
