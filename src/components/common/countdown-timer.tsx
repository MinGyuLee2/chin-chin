"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date | string;
  onExpire?: () => void;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

function getTimeRemaining(expiresAt: Date) {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isExpired: false };
}

function formatTime(time: ReturnType<typeof getTimeRemaining>) {
  if (time.isExpired) return "만료됨";

  if (time.hours > 0) {
    return `${time.hours}시간 ${time.minutes}분 남음`;
  }

  if (time.minutes > 0) {
    return `${time.minutes}분 ${time.seconds}초 남음`;
  }

  return `${time.seconds}초 남음`;
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  showIcon = true,
  className,
  size = "md",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(new Date(expiresAt))
  );

  useEffect(() => {
    const expires = new Date(expiresAt);

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expires);
      setTimeRemaining(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent =
    !timeRemaining.isExpired &&
    timeRemaining.hours === 0 &&
    timeRemaining.minutes < 30;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        sizeClasses[size],
        timeRemaining.isExpired
          ? "text-muted-foreground"
          : isUrgent
            ? "text-destructive"
            : "text-muted-foreground",
        className
      )}
    >
      {showIcon && (
        <Clock
          className={cn(
            iconSizeClasses[size],
            isUrgent && "animate-pulse-soft"
          )}
        />
      )}
      <span className={cn("font-medium", isUrgent && "animate-pulse-soft")}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
