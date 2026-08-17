import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface TotalBadgeProps {
  label?: string;
  value?: string;
  className?: string;
}

export function TotalBadge({ label = "TOTAL A PAGAR", value = "$0", className }: TotalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-primary-foreground/20 px-2 py-1 text-xs font-bold text-primary-foreground backdrop-blur-sm",
        "sm:px-2.5 sm:py-1.5 sm:text-sm",
        className,
      )}
    >
      <DollarSign className="size-3.5 shrink-0 sm:size-4" />
      <span className="hidden sm:inline">{label}:</span>
      <span className="sm:hidden">{label.split(" ").map((w) => w[0]).join("")}:</span>
      <span>{value}</span>
    </span>
  );
}
