import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Turno } from "@/lib/turnos";

function Chip({ turno, size }: { turno: Turno; size: "sm" | "lg" }) {
  const esParticular = turno.tipo === "particular";
  const etiqueta = esParticular ? "P" : turno.obraSocial?.trim() ? turno.obraSocial : "O.S";

  const chip = (
    <span
      className={cn(
        "shrink min-w-0 truncate rounded px-1 font-bold",
        size === "sm"
          ? "max-w-[5.5rem] text-[9px] leading-4"
          : "max-w-[9rem] px-1.5 py-0.5 text-[11px]",
        esParticular
          ? "bg-particular text-particular-foreground"
          : "bg-obra-social text-obra-social-foreground",
      )}
    >
      {etiqueta}
    </span>
  );

  if (esParticular || !turno.obraSocial?.trim()) return chip;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{chip}</TooltipTrigger>
        <TooltipContent side="top">{turno.obraSocial}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TurnoLine({ turno, size = "sm" }: { turno: Turno; size?: "sm" | "lg" }) {
  if (size === "sm") {
    return (
      <div className="flex flex-wrap items-baseline gap-x-1 rounded bg-muted/60 px-1 py-px text-[10px] leading-snug sm:text-xs">
        <span className="font-semibold tabular-nums">{turno.hora}</span>
        <span className="text-muted-foreground">-</span>
        <span className="break-words">{turno.nombre}</span>
        <span className="text-muted-foreground">-</span>
        <Chip turno={turno} size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-sm leading-tight">
      <span className="font-semibold tabular-nums">{turno.hora}</span>
      <span className="break-words">
        {turno.nombre}
        {turno.observacion ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{turno.observacion}</span>
        ) : null}
      </span>
      <span className="ml-auto">
        <Chip turno={turno} size="lg" />
      </span>
    </div>
  );
}
