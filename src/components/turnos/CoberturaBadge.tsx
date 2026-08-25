import { cn } from "@/lib/utils";
import type { TipoConsulta } from "@/lib/turnos";

interface Props {
  tipo: TipoConsulta;
  label: string;
  esDiscapacidad?: boolean;
  className?: string;
}

export function CoberturaBadge({ tipo, label, esDiscapacidad, className }: Props) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-bold",
        tipo === "particular"
          ? "bg-particular text-particular-foreground"
          : "bg-obra-social text-obra-social-foreground",
        className,
      )}
    >
      {label}
      {esDiscapacidad && (
        <span className="ml-1 inline-block rounded bg-current/15 px-0.5 text-[8px] leading-tight opacity-80">
          DISC
        </span>
      )}
    </span>
  );
}
