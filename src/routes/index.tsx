import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/turnos/CalendarGrid";
import { TurnoDialog } from "@/components/turnos/TurnoDialog";
import { DayDetailDialog } from "@/components/turnos/DayDetailDialog";
import { UserMenu } from "@/components/turnos/UserMenu";
import { LoginModal } from "@/components/auth/LoginModal";
import { getSession, getToken } from "@/lib/auth";
import { API_V1_PREFIX, getApiBaseUrl } from "@/lib/config";
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/hooks/use-appointments";
import { useCreatePatient, usePatients } from "@/hooks/use-patients";
import { useObraSociales } from "@/hooks/use-obra-sociales";
import { MESES, appointmentsToTurnos, type TipoConsulta, type Turno } from "@/lib/turnos";
import { PageShell } from "@/components/layout/PageShell";
import { CoberturaBadge } from "@/components/turnos/CoberturaBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda de Turnos | Calendario mensual" },
      {
        name: "description",
        content:
          "Agenda mensual de turnos: cargá pacientes por día, diferenciá Particular y Obra Social y descargá la planilla de sesiones en PDF.",
      },
      { property: "og:title", content: "Agenda de Turnos | Calendario mensual" },
      {
        property: "og:description",
        content: "Cargá turnos desde el celular y descargá la planilla de sesiones del mes en PDF.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [formFecha, setFormFecha] = useState<string | null>(null);
  const [detalleFecha, setDetalleFecha] = useState<string | null>(null);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [exportingPlanilla, setExportingPlanilla] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) setLoginOpen(true);
  }, [mounted]);

  const { data: appointments = [], isLoading, error } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: obrasSociales = [] } = useObraSociales();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const createPatient = useCreatePatient();

  const turnos = useMemo(
    () => appointmentsToTurnos(appointments, patients, obrasSociales),
    [appointments, patients, obrasSociales],
  );

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

  const handleSave = async (data: {
    id?: number;
    fecha: string;
    hora: string;
    nombre: string;
    patientId?: number | null;
    tipo: TipoConsulta;
    obraSocial?: string;
    observacion?: string;
  }) => {
    try {
      const nombre = data.nombre.trim();
      let patientId: number | null = data.patientId ?? null;

      if (patientId == null) {
        const match = patients.find(
          (p) => p.nombre_completo.trim().toLowerCase() === nombre.toLowerCase(),
        );
        if (match) patientId = match.id;
      }

      let obraSocialId: number | null = null;
      if (data.tipo === "obra_social") {
        if (!data.obraSocial) {
          throw new Error("Seleccioná una obra social.");
        }
        const found = obrasSociales.find(
          (o) => o.nombre.trim().toLowerCase() === data.obraSocial!.trim().toLowerCase(),
        );
        if (!found) {
          throw new Error(`La obra social "${data.obraSocial}" no existe en el sistema.`);
        }
        obraSocialId = found.id;
      }

      const base = {
        obra_social_id: obraSocialId,
        fecha: data.fecha,
        hora_inicio: data.hora,
        tipo_consulta: data.tipo === "obra_social" ? "Obra Social" : "Particular",
        observaciones: data.observacion?.trim() ? data.observacion.trim() : null,
      };

      if (data.id != null) {
        await updateAppointment.mutateAsync({
          id: data.id,
          ...base,
          ...(patientId != null ? { patient_id: patientId } : { nombre_completo: nombre }),
        });
        toast.success("Turno actualizado");
      } else {
        if (patientId == null) {
          const created = await createPatient.mutateAsync({
            nombre_completo: nombre,
            telefono: null,
            obra_social_id: null,
            observaciones: null,
          });
          patientId = created.id;
        }
        await createAppointment.mutateAsync({ ...base, patient_id: patientId });
        toast.success("Turno guardado");
      }

      setFormFecha(null);
      setEditingTurno(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el turno.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment.mutateAsync(id);
      toast.success("Turno eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar el turno.");
    }
  };

  const getFilenameFromDisposition = (disposition: string | null, fallback: string): string => {
    if (!disposition) return fallback;
    const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
    if (star?.[1]) {
      try {
        return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
      } catch {
        // ignore malformed encoded filename
      }
    }
    const plain = /filename=(?:"([^"]+)"|([^;]+))/i.exec(disposition);
    const name = plain?.[1] ?? plain?.[2];
    return name?.trim() ? name.trim() : fallback;
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const handleExportPlanilla = async () => {
    setExportingPlanilla(true);
    try {
      const token = getToken();
      const url = `${getApiBaseUrl()}${API_V1_PREFIX}/export/planilla-sesiones?year=${year}&month=${month + 1}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("No se pudo generar la planilla de sesiones.");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      downloadBlob(
        blob,
        getFilenameFromDisposition(
          disposition,
          `planilla-sesiones-${MESES[month]?.toLowerCase()}-${year}.pdf`,
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar la planilla de sesiones.");
    } finally {
      setExportingPlanilla(false);
    }
  };

  const detalleTurnos = detalleFecha ? (turnosPorDia[detalleFecha] ?? []) : [];

  return (
    <PageShell>
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
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Button
              onClick={handleExportPlanilla}
              disabled={exportingPlanilla}
              size="sm"
              className="gap-1.5"
            >
              <FileText className="size-4" />
              {exportingPlanilla ? "Generando..." : "Descargar planilla de sesiones"}
            </Button>
          </div>
        </header>

        <div className="space-y-0 rounded-lg bg-card">
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

          {isLoading && (
            <div className="border-b border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              Cargando turnos…
            </div>
          )}
          {!isLoading && error && (
            <div className="border-b border-border bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              No se pudieron cargar los turnos del servidor.
            </div>
          )}

          <CalendarGrid
            year={year}
            month={month}
            turnosPorDia={turnosPorDia}
            onDayClick={(key) => setFormFecha(key)}
            onTurnosClick={(key: string) => setDetalleFecha(key)}
          />
        </div>

        <div className="flex w-fit items-center gap-2">
          <div className="flex items-center gap-4 rounded-lg bg-card/85 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <CoberturaBadge tipo="particular" label="P" />
              Particular
            </span>
            <span className="flex items-center gap-1.5">
              <CoberturaBadge tipo="obra_social" label="O.S" />
              Obra Social
            </span>
          </div>
          <div className="flex items-center rounded-lg bg-card/85 px-1 py-1 shadow-sm backdrop-blur-sm">
            <UserMenu />
          </div>
        </div>
      </div>

      <TurnoDialog
        fecha={formFecha}
        turno={editingTurno}
        onClose={() => {
          setFormFecha(null);
          setEditingTurno(null);
        }}
        onSave={handleSave}
      />
      <DayDetailDialog
        fecha={detalleFecha}
        turnos={detalleTurnos}
        onClose={() => setDetalleFecha(null)}
        onDelete={handleDelete}
        onEdit={(t) => {
          setDetalleFecha(null);
          setEditingTurno(t);
        }}
        onAdd={() => {
          const f = detalleFecha;
          setDetalleFecha(null);
          setFormFecha(f);
        }}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} blockDismiss />
    </PageShell>
  );
}
