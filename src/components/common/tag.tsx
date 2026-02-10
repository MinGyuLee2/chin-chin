import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "muted" | "success" | "warning";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const variantClasses = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary/10 text-secondary",
  muted: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
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
        "inline-flex items-center rounded-full font-medium transition-all duration-200",
        !selected && variantClasses[variant],
        sizeClasses[size],
        isInteractive && "cursor-pointer hover:opacity-80 active:scale-95",
        selected && "bg-primary text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)]",
        className
      )}
    >
      {children}
    </span>
  );
}
