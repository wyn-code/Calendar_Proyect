import { DIAS, MESES, toKey, buildMonthGrid, type Turno } from "@/lib/turnos";
import { cn } from "@/lib/utils";
import { TurnoLine } from "./TurnoLine";

interface Props {
  year: number;
  month: number;
  turnosPorDia: Record<string, Turno[]>;
  onDayClick: (key: string) => void;
  onMoreClick: (key: string) => void;
}

export function CalendarGrid({ year, month, turnosPorDia, onDayClick, onMoreClick }: Props) {
  const weeks = buildMonthGrid(year, month);
  const todayKey = toKey(new Date());

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {DIAS.map((d) => (
          <div
            key={d}
            className="border-r border-border py-2 text-center text-[10px] font-bold tracking-wide text-muted-foreground last:border-r-0 sm:text-xs"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.flat().map((date) => {
          const key = toKey(date);
          const inMonth = date.getMonth() === month;
          const turnos = turnosPorDia[key] ?? [];
          const visibles = turnos.slice(0, 2);
          const restantes = turnos.length - visibles.length;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onDayClick(key)}
              className={cn(
                "flex min-h-[76px] flex-col items-stretch border-t border-r border-border p-1 text-left transition-colors hover:bg-accent/60 sm:min-h-[110px] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "mb-1 self-start rounded px-1 text-[11px] font-semibold tabular-nums sm:text-xs",
                  !inMonth && "text-muted-foreground/50",
                  key === todayKey && "bg-primary text-primary-foreground",
                )}
              >
                {date.getDate()}
              </span>

              <div className="min-w-0 space-y-0.5">
                {visibles.map((t) => (
                  <TurnoLine key={t.id} turno={t} />
                ))}
                {restantes > 0 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreClick(key);
                    }}
                    className="block text-[10px] font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    +{restantes} más
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="sr-only">
        {MESES[month]} {year}
      </div>
    </div>
  );
}
