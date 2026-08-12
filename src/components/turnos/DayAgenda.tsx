import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Turno } from "@/lib/turnos";
import { TurnoCard } from "./TurnoCard";

interface Props {
  turnos: Turno[];
  onSelect: (turno: Turno) => void;
  onAdd: () => void;
}

export function DayAgenda({ turnos, onSelect, onAdd }: Props) {
  if (turnos.length === 0) {
    return (
      <div className="flex animate-in fade-in-0 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/85 px-6 py-12 text-center backdrop-blur-sm duration-300">
        <div className="grid size-14 place-items-center rounded-full bg-muted">
          <CalendarDays className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">No hay turnos este día</p>
          <p className="text-sm text-muted-foreground">Agregá el primero para empezar la agenda.</p>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Agregar turno
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-2 duration-300">
      {turnos.map((t) => (
        <TurnoCard key={t.id} turno={t} onClick={() => onSelect(t)} />
      ))}
    </div>
  );
}
