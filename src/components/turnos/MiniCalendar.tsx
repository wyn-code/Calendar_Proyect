import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIAS, MESES, buildMonthGrid, toKey } from "@/lib/turnos";
import { cn } from "@/lib/utils";

interface Props {
  selected: string;
  onSelect: (key: string) => void;
}

export function MiniCalendar({ selected, onSelect }: Props) {
  const parts = selected.split("-").map(Number);
  const [cursor, setCursor] = useState(() => new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, 1));
  const todayKey = toKey(new Date());
  const weeks = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <div className="w-[17rem] p-1">
      <div className="mb-1 flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => shift(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {MESES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => shift(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7">
        {DIAS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-bold text-muted-foreground">
            {d}
          </div>
        ))}
        {weeks.flat().map((date) => {
          const key = toKey(date);
          const inMonth = date.getMonth() === cursor.getMonth();
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                "m-0.5 grid size-8 place-items-center rounded-md text-xs font-medium tabular-nums transition-colors",
                !inMonth && "text-muted-foreground/50",
                key === todayKey && key !== selected && "text-primary font-bold",
                key === selected
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
