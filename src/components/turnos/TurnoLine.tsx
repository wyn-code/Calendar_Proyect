import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Turno } from "@/lib/turnos";
import { CoberturaBadge } from "./CoberturaBadge";

function Chip({ turno, size }: { turno: Turno; size: "sm" | "lg" }) {
  const esParticular = turno.tipo === "particular";
  const etiqueta = esParticular ? "P" : turno.obraSocial?.trim() || "O.S";

  const chip = (
    <CoberturaBadge
      tipo={turno.tipo}
      label={etiqueta}
      className={cn(
        "shrink min-w-0",
        size === "sm"
          ? "max-w-[5.5rem] truncate px-1 text-[9px] leading-4"
          : "max-w-[9rem] truncate px-1.5 py-0.5 text-[11px]",
      )}
    />
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
    const esParticular = turno.tipo === "particular";
    const cobertura = esParticular ? "Particular" : turno.obraSocial?.trim() || "Obra Social";

    return (
      <div className="min-w-0 break-words border-b border-border/50 px-1 py-1 text-[10px] leading-snug last:border-b-0 sm:text-xs">
        <div className="font-semibold tabular-nums">{turno.hora}</div>
        <div className="break-words">{turno.nombre}</div>
        <CoberturaBadge
          tipo={turno.tipo}
          label={cobertura}
          className="mt-0.5 w-fit max-w-full break-words whitespace-normal px-1 py-px text-[9px] leading-[1.2]"
        />
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
