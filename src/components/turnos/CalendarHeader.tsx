import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MiniCalendar } from "./MiniCalendar";

interface Props {
  label: string;
  selected: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onPick: (key: string) => void;
}

export function CalendarHeader({ label, selected, onPrev, onNext, onToday, onPick }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Anterior"
        onClick={onPrev}
        className="size-10 shrink-0"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="min-h-10 min-w-0 flex-1 gap-1.5 px-2 text-sm font-bold tracking-wide uppercase"
          >
            <CalendarDays className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto p-2">
          <MiniCalendar selected={selected} onSelect={onPick} />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Siguiente"
        onClick={onNext}
        className="size-10 shrink-0"
      >
        <ChevronRight className="size-5" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToday} className="min-h-10 shrink-0">
        Hoy
      </Button>
    </div>
  );
}
