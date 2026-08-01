import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/turnos";

export function TurnoLine({ turno, size = "sm" }: { turno: Turno; size?: "sm" | "lg" }) {
  const esParticular = turno.tipo === "particular";
  return (
    <div
      className={cn(
        "flex items-center gap-1 truncate leading-tight",
        size === "sm" ? "text-[10px] sm:text-[11px]" : "text-sm",
      )}
    >
      <span className="font-semibold tabular-nums">{turno.hora}</span>
      <span className="truncate text-muted-foreground">{turno.nombre}</span>
      <span
        className={cn(
          "ml-auto shrink-0 rounded px-1 font-bold",
          size === "sm" ? "text-[9px]" : "text-[11px] px-1.5 py-0.5",
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
