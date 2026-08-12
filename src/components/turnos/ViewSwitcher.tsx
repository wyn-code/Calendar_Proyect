import { cn } from "@/lib/utils";

export type Vista = "dia" | "semana" | "mes";

const OPCIONES: { value: Vista; label: string }[] = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

export function ViewSwitcher({
  value,
  onChange,
  className,
}: {
  value: Vista;
  onChange: (v: Vista) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Selector de vista"
      className={cn("grid grid-cols-3 gap-1 rounded-xl bg-muted p-1", className)}
    >
      {OPCIONES.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-11 rounded-lg px-3 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
