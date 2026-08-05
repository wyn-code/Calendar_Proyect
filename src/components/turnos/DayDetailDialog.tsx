import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatFechaLarga, type Turno } from "@/lib/turnos";
import { TurnoLine } from "./TurnoLine";

interface Props {
  fecha: string | null;
  turnos: Turno[];
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (turno: Turno) => void;
  onAdd: () => void;
}

export function DayDetailDialog({ fecha, turnos, onClose, onDelete, onEdit, onAdd }: Props) {
  return (
    <Dialog open={fecha !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Turnos del día</DialogTitle>
          <DialogDescription>{fecha ? formatFechaLarga(fecha) : ""}</DialogDescription>
        </DialogHeader>

        <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto">
          {turnos.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-md border border-border p-2">
              <div className="min-w-0 flex-1">
                <TurnoLine turno={t} size="lg" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label="Editar turno"
                onClick={() => onEdit(t)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label="Eliminar turno"
                onClick={() => onDelete(t.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
          {turnos.length === 0 && (
            <li className="py-4 text-center text-sm text-muted-foreground">Sin turnos</li>
          )}
        </ul>

        <Button onClick={onAdd}>Agregar turno</Button>
      </DialogContent>
    </Dialog>
  );
}
