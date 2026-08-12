import { cn } from "@/lib/utils";
import type { TipoConsulta } from "@/lib/turnos";

interface Props {
  tipo: TipoConsulta;
  label: string;
  className?: string;
}

export function CoberturaBadge({ tipo, label, className }: Props) {
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
    </span>
  );
}
