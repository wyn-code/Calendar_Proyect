import { Check, ChevronDown, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useMockStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

/**
 * Filtro transversal por consultorio. Único componente, reutilizado en todas
 * las secciones menos Calendario. En mobile (o con muchos consultorios)
 * colapsa en un dropdown de una sola fila.
 */
export function ConsultorioFilter({ className }: { className?: string }) {
  const { consultorios, filtroConsultorio, setFiltroConsultorio } = useMockStore();
  const isMobile = useIsMobile();

  const opciones = ["Todos", ...consultorios.map((c) => c.nombre)];
  const comoDropdown = isMobile || opciones.length > 4;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg bg-card/90 px-3 py-2 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">Consultorio</span>

      {comoDropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto min-h-11 min-w-0 flex-1 justify-between sm:flex-none"
            >
              <span className="truncate">{filtroConsultorio}</span>
              <ChevronDown className="size-4 shrink-0 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem]">
            {opciones.map((o) => (
              <DropdownMenuItem
                key={o}
                className="min-h-11"
                onSelect={() => setFiltroConsultorio(o)}
              >
                <span className="truncate">{o}</span>
                {o === filtroConsultorio && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="ml-auto flex min-w-0 gap-1.5">
          {opciones.map((o) => (
            <Button
              key={o}
              size="sm"
              variant={o === filtroConsultorio ? "default" : "outline"}
              className="min-h-10"
              onClick={() => setFiltroConsultorio(o)}
            >
              <span className="truncate">{o}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
