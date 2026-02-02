import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  asLink?: boolean;
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Logo({ size = "md", className, asLink = true }: LogoProps) {
  const content = (
    <span
      className={cn(
        "font-display font-bold gradient-text",
        sizeClasses[size],
        className
      )}
    >
      친친
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
