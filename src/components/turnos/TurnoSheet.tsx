import { Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { formatFechaLarga, type Turno } from "@/lib/turnos";
import { CoberturaBadge } from "./CoberturaBadge";

interface Props {
  turno: Turno | null;
  onClose: () => void;
  onEdit: (turno: Turno) => void;
  onDelete: (id: number) => void;
}

export function TurnoSheet({ turno, onClose, onEdit, onDelete }: Props) {
  return (
    <BottomSheet open={turno !== null} onOpenChange={(o) => !o && onClose()}>
      <BottomSheetContent>
        {turno ? (
          <>
            <BottomSheetHeader>
              <BottomSheetTitle className="text-lg font-bold">{turno.nombre}</BottomSheetTitle>
              <BottomSheetDescription>{formatFechaLarga(turno.fecha)}</BottomSheetDescription>
            </BottomSheetHeader>

            <div className="space-y-3 rounded-xl border border-border p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="size-4 text-primary" aria-hidden />
                <span className="tabular-nums">{turno.hora}</span>
                <CoberturaBadge
                  tipo={turno.tipo}
                  label={
                    turno.tipo === "particular"
                      ? "Particular"
                      : turno.obraSocial?.trim() || "Obra Social"
                  }
                  className="ml-auto text-[10px]"
                />
              </div>
              {turno.observacion ? (
                <p className="text-sm text-muted-foreground">{turno.observacion}</p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="min-h-11 gap-1.5" onClick={() => onEdit(turno)}>
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                className="min-h-11 gap-1.5"
                onClick={() => onDelete(turno.id)}
              >
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </div>
          </>
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  );
}
