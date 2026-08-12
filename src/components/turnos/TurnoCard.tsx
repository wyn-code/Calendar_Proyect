import { Clock } from "lucide-react";
import type { Turno } from "@/lib/turnos";
import { CoberturaBadge } from "./CoberturaBadge";

export function TurnoCard({ turno, onClick }: { turno: Turno; onClick?: () => void }) {
  const esParticular = turno.tipo === "particular";
  const cobertura = esParticular ? "Particular" : turno.obraSocial?.trim() || "Obra Social";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-h-[64px] items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 py-2">
        <Clock className="size-3.5 text-primary" aria-hidden />
        <span className="text-sm font-bold tabular-nums text-primary">{turno.hora}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold leading-tight">{turno.nombre}</p>
        {turno.observacion ? (
          <p className="truncate text-xs text-muted-foreground">{turno.observacion}</p>
        ) : null}
      </div>
      <CoberturaBadge
        tipo={turno.tipo}
        label={cobertura}
        className="max-w-[7rem] shrink-0 truncate text-[10px]"
      />
    </button>
  );
}
