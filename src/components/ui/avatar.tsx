import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  blurred?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "Avatar", size = "md", blurred, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-muted ring-2 ring-white shadow-soft",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={cn("object-cover", blurred && "blur-xl")}
            sizes={
              size === "xl"
                ? "128px"
                : size === "lg"
                  ? "80px"
                  : size === "md"
                    ? "48px"
                    : "32px"
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-1/2 w-1/2 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
