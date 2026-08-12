import { DIAS, toKey, type Turno } from "@/lib/turnos";
import { cn } from "@/lib/utils";

interface Props {
  days: Date[];
  selected: string;
  turnosPorDia: Record<string, Turno[]>;
  onSelect: (key: string) => void;
}

export function WeekStrip({ days, selected, turnosPorDia, onSelect }: Props) {
  const todayKey = toKey(new Date());

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {days.map((d) => {
        const key = toKey(d);
        const count = turnosPorDia[key]?.length ?? 0;
        const active = key === selected;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={active}
            className={cn(
              "flex min-h-[60px] min-w-[3rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 transition-all duration-200",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card/85 backdrop-blur-sm hover:border-primary/40",
            )}
          >
            <span className="text-[10px] font-semibold tracking-wide uppercase opacity-80">
              {DIAS[d.getDay()]}
            </span>
            <span
              className={cn(
                "text-base font-bold tabular-nums",
                !active && key === todayKey && "text-primary",
              )}
            >
              {d.getDate()}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                count > 0 ? (active ? "bg-primary-foreground" : "bg-primary") : "bg-transparent",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
