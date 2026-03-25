import type { SignalType } from "@prisma/client";
import { SIGNAL_TYPE_LABELS, SIGNAL_TYPE_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SignalBadgeProps {
  type: SignalType;
  className?: string;
}

export function SignalBadge({ type, className }: SignalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        SIGNAL_TYPE_COLORS[type],
        className
      )}
    >
      {SIGNAL_TYPE_LABELS[type]}
    </span>
  );
}
