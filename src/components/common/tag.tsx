import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "muted";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const variantClasses = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary/10 text-secondary",
  muted: "bg-muted text-muted-foreground",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Tag({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  selected,
}: TagProps) {
  const isInteractive = !!onClick;

  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all",
        variantClasses[variant],
        sizeClasses[size],
        isInteractive && "cursor-pointer hover:opacity-80 active:scale-95",
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {children}
    </span>
  );
}
