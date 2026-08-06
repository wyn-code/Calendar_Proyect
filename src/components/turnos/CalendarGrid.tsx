import { DIAS, MESES, toKey, buildMonthGrid, type Turno } from "@/lib/turnos";
import { cn } from "@/lib/utils";
import { TurnoLine } from "./TurnoLine";

interface Props {
  year: number;
  month: number;
  turnosPorDia: Record<string, Turno[]>;
  onDayClick: (key: string) => void;
  onTurnosClick: (key: string) => void;
  exporting?: boolean;
}

export function CalendarGrid({
  year,
  month,
  turnosPorDia,
  onDayClick,
  onTurnosClick,
  exporting = false,
}: Props) {
  const weeks = buildMonthGrid(year, month);
  const todayKey = toKey(new Date());

  return (
    <div className="overflow-hidden rounded-b-lg border border-border bg-card">
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

      <div className="grid grid-cols-7" data-export-week>
        {weeks.flat().map((date) => {
          const key = toKey(date);
          const inMonth = date.getMonth() === month;
          const turnos = turnosPorDia[key] ?? [];

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onDayClick(key);
              }}
              className={cn(
                "flex min-h-[58px] cursor-pointer flex-col items-stretch border-t border-r border-border p-1 text-left transition-colors hover:bg-accent/60 sm:min-h-[84px] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "mb-0.5 self-start rounded px-1 text-[11px] font-semibold tabular-nums sm:text-xs",
                  !inMonth && "text-muted-foreground/50",
                  key === todayKey && "bg-primary text-primary-foreground",
                )}
              >
                {date.getDate()}
              </span>

              {turnos.length > 0 && (
                <div
                  className={cn("min-w-0", exporting ? "grid grid-cols-2 gap-px" : "space-y-px")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTurnosClick(key);
                  }}
                >
                  {turnos.map((t) => (
                    <TurnoLine key={t.id} turno={t} dense={exporting} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sr-only">
        {MESES[month]} {year}
      </div>
    </div>
  );
}
