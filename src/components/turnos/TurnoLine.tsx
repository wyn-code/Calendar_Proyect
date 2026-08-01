import { cn } from "@/lib/utils";
import type { Turno } from "@/lib/turnos";

export function TurnoLine({ turno, size = "sm" }: { turno: Turno; size?: "sm" | "lg" }) {
  const esParticular = turno.tipo === "particular";
  const chip = (
    <span
      className={cn(
        "shrink-0 rounded px-1 font-bold",
        size === "sm" ? "text-[9px] leading-4" : "px-1.5 py-0.5 text-[11px]",
        esParticular
          ? "bg-particular text-particular-foreground"
          : "bg-obra-social text-obra-social-foreground",
      )}
    >
      {esParticular ? "P" : "O.S"}
    </span>
  );

  if (size === "sm") {
    return (
      <div className="flex flex-wrap items-baseline gap-x-1 rounded bg-muted/60 px-1 py-px text-[10px] leading-snug sm:text-xs">
        <span className="font-semibold tabular-nums">{turno.hora}</span>
        <span className="text-muted-foreground">-</span>
        <span className="break-words">{turno.nombre}</span>
        <span className="text-muted-foreground">-</span>
        {chip}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm leading-tight">
      <span className="font-semibold tabular-nums">{turno.hora}</span>
      <span className="break-words">{turno.nombre}</span>
      <span className="ml-auto">{chip}</span>
    </div>
  );
}
