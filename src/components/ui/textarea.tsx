import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-base transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(255,107,107,0.1)] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
