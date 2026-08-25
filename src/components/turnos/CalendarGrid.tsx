import { DIAS, MESES, toKey, buildMonthGrid, type Turno } from "@/lib/turnos";
import { cn } from "@/lib/utils";
import { Minimize2, Maximize2 } from "lucide-react";
import { TurnoLine } from "./TurnoLine";

interface Props {
  year: number;
  month: number;
  turnosPorDia: Record<string, Turno[]>;
  collapsedWeeks: Set<number>;
  onToggleWeek: (weekIndex: number) => void;
  onDayClick: (key: string) => void;
  onTurnosClick: (key: string) => void;
}

export function CalendarGrid({
  year,
  month,
  turnosPorDia,
  collapsedWeeks,
  onToggleWeek,
  onDayClick,
  onTurnosClick,
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

      <div className="border-b border-border last:border-b-0">
        {weeks.map((week, weekIdx) => {
          const isCollapsed = collapsedWeeks.has(weekIdx);

          return (
            <div
              key={weekIdx}
              className={cn(
                "grid grid-cols-[auto_1fr] border-b border-border last:border-b-0",
                isCollapsed && "bg-muted/20",
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWeek(weekIdx);
                }}
                aria-label={isCollapsed ? "Expandir semana" : "Minimizar semana"}
                className={cn(
                  "flex w-7 shrink-0 flex-col items-center justify-center border-r border-border transition-colors sm:w-8",
                  isCollapsed
                    ? "bg-muted/60 text-muted-foreground hover:bg-muted"
                    : "text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground",
                )}
              >
                {isCollapsed ? (
                  <Maximize2 className="size-3" />
                ) : (
                  <Minimize2 className="size-3" />
                )}
              </button>

              <div className="grid grid-cols-7">
                {week.map((date) => {
                  const key = toKey(date);
                  const inMonth = date.getMonth() === month;
                  const turnos = turnosPorDia[key] ?? [];

                  if (isCollapsed) {
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
                          "flex cursor-pointer flex-col items-center justify-center border-r border-border py-1.5 text-center transition-colors hover:bg-accent/60 last:border-r-0",
                          !inMonth && "bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[11px] font-semibold tabular-nums sm:text-xs",
                            !inMonth && "text-muted-foreground/50",
                            key === todayKey && "rounded bg-primary px-1 text-primary-foreground",
                          )}
                        >
                          {date.getDate()}
                        </span>
                        {turnos.length > 0 && (
                          <span className="mt-0.5 rounded-full bg-primary/15 px-1 text-[9px] font-bold text-primary tabular-nums">
                            {turnos.length}
                          </span>
                        )}
                      </div>
                    );
                  }

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
                        "flex cursor-pointer flex-col items-stretch border-r border-border p-1 text-left transition-colors hover:bg-accent/60 min-h-[58px] last:border-r-0 sm:min-h-[84px] sm:p-1.5",
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
                          className="min-w-0 space-y-px"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTurnosClick(key);
                          }}
                        >
                          {turnos.map((t) => (
                            <TurnoLine key={t.id} turno={t} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
