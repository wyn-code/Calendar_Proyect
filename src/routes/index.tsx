import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarGrid } from "@/components/turnos/CalendarGrid";
import { TurnoDialog } from "@/components/turnos/TurnoDialog";
import { DayDetailDialog } from "@/components/turnos/DayDetailDialog";
import { MESES, loadTurnos, saveTurnos, type TipoConsulta, type Turno } from "@/lib/turnos";
import fondoFloral from "@/assets/fondo-floral.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda de Turnos | Calendario mensual" },
      {
        name: "description",
        content:
          "Agenda mensual de turnos: cargá pacientes por día, diferenciá Particular y Obra Social y descargá el calendario en PDF.",
      },
      { property: "og:title", content: "Agenda de Turnos | Calendario mensual" },
      {
        property: "og:description",
        content: "Cargá turnos desde el celular y exportá el mes completo en PDF A4 apaisado.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [formFecha, setFormFecha] = useState<string | null>(null);
  const [detalleFecha, setDetalleFecha] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTurnos(loadTurnos()), []);

  const update = (next: Turno[]) => {
    setTurnos(next);
    saveTurnos(next);
  };

  const turnosPorDia = useMemo(() => {
    const map: Record<string, Turno[]> = {};
    for (const t of turnos) {
      (map[t.fecha] ??= []).push(t);
    }
    for (const key of Object.keys(map)) {
      map[key]?.sort((a, b) => a.hora.localeCompare(b.hora));
    }
    return map;
  }, [turnos]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const handleSave = (data: { hora: string; nombre: string; tipo: TipoConsulta }) => {
    if (!formFecha) return;
    update([
      ...turnos,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fecha: formFecha,
        ...data,
      },
    ]);
    setFormFecha(null);
  };

  const handleExport = async () => {
    if (!gridRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(gridRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentW = pw - margin * 2;
      const contentH = ph - margin * 2;
      // Escala para que el ancho completo entre en A4 vertical.
      const scale = contentW / canvas.width;
      const totalH = canvas.height * scale;
      // Alto de canvas (px) que entra en una página.
      const pageCanvasH = Math.floor(contentH / scale);

      let offset = 0;
      let page = 0;
      while (offset < canvas.height) {
        const sliceH = Math.min(pageCanvasH, canvas.height - offset);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d");
        if (!ctx) break;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, offset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          contentW,
          sliceH * scale,
        );
        offset += sliceH;
        page += 1;
      }
      if (totalH <= 0) return;
      pdf.save(`turnos-${MESES[month]?.toLowerCase()}-${year}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const detalleTurnos = detalleFecha ? (turnosPorDia[detalleFecha] ?? []) : [];

  return (
    <main className="relative min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fondoFloral})` }}
      />
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-card/85 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:flex sm:justify-between sm:px-4">

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
              Agenda de Turnos
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Tocá un día para cargar un turno
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={exporting}
            size="sm"
            className="shrink-0 gap-1.5"
          >
            <Download className="size-4" />
            {exporting ? "Generando..." : "Descargar PDF"}
          </Button>
        </header>

        <div ref={gridRef} className="space-y-0 rounded-lg bg-card">
          <div className="flex items-center justify-between rounded-t-lg bg-primary px-3 py-2.5 text-primary-foreground">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => shiftMonth(-1)}
              className="size-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h2 className="truncate text-sm font-bold tracking-wide uppercase sm:text-base">
              {MESES[month]} {year}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => shiftMonth(1)}
              className="size-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <CalendarGrid
            year={year}
            month={month}
            turnosPorDia={turnosPorDia}
            onDayClick={(key) => setFormFecha(key)}
            onTurnosClick={(key: string) => setDetalleFecha(key)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit items-center gap-4 rounded-lg bg-card/85 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-particular px-1.5 py-0.5 font-bold text-particular-foreground">
                P
              </span>
              Particular
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-obra-social px-1.5 py-0.5 font-bold text-obra-social-foreground">
                O.S
              </span>
              Obra Social
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Menú de usuario"
                className="size-9 rounded-full bg-card/85 backdrop-blur-sm"
              >
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TurnoDialog fecha={formFecha} onClose={() => setFormFecha(null)} onSave={handleSave} />
      <DayDetailDialog
        fecha={detalleFecha}
        turnos={detalleTurnos}
        onClose={() => setDetalleFecha(null)}
        onDelete={(id) => update(turnos.filter((t) => t.id !== id))}
        onAdd={() => {
          const f = detalleFecha;
          setDetalleFecha(null);
          setFormFecha(f);
        }}
      />
    </main>
  );
}
