import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/turnos";

export function TurnoLine({ turno, size = "sm" }: { turno: Turno; size?: "sm" | "lg" }) {
  const esParticular = turno.tipo === "particular";
  if (size === "sm") {
    return (
      <div className="min-w-0 rounded bg-muted/60 px-1 py-0.5 leading-tight">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold tabular-nums sm:text-[11px]">{turno.hora}</span>
          <span
            className={cn(
              "ml-auto shrink-0 rounded px-1 text-[9px] font-bold",
              esParticular
                ? "bg-particular text-particular-foreground"
                : "bg-obra-social text-obra-social-foreground",
            )}
          >
            {esParticular ? "P" : "O.S"}
          </span>
        </div>
        <div className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
          {turno.nombre}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm leading-tight">
      <span className="font-semibold tabular-nums">{turno.hora}</span>
      <span className="truncate">{turno.nombre}</span>
      <span
        className={cn(
          "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold",
          esParticular
            ? "bg-particular text-particular-foreground"
            : "bg-obra-social text-obra-social-foreground",
        )}
      >
        {esParticular ? "P" : "O.S"}
      </span>
    </div>
  );
}
