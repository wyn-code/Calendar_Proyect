import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { sileo } from "sileo";
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
import { useCreatePatient, usePatients, useUpdatePatient } from "@/hooks/use-patients";
import { useObraSociales } from "@/hooks/use-obra-sociales";
import { MESES, appointmentsToTurnos, type TipoConsulta, type Turno } from "@/lib/turnos";
import { normalizeNombre } from "@/lib/normalize";
import type { Consultorio } from "@/lib/api";
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
  const updatePatient = useUpdatePatient();

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
    consultorio?: Consultorio | null;
    tipo: TipoConsulta;
    obraSocial?: string;
    observacion?: string;
  }) => {
    try {
      // Validación de campos obligatorios. Único campo opcional: "observacion".
      if (!data.fecha) {
        throw new Error("La fecha es obligatoria.");
      }
      if (!data.hora?.trim()) {
        throw new Error("El horario de inicio es obligatorio.");
      }
      if (!data.consultorio) {
        throw new Error("Seleccioná un consultorio.");
      }
      if (!data.nombre?.trim()) {
        throw new Error("El nombre y apellido son obligatorios.");
      }
      if (!data.tipo) {
        throw new Error("Seleccioná el tipo de consulta.");
      }
      if (data.tipo === "obra_social" && !data.obraSocial?.trim()) {
        throw new Error("Seleccioná una obra social.");
      }

      const nombre = data.nombre.trim();
      const consultorio = data.consultorio;
      let patientId: number | null = data.patientId ?? null;

      if (patientId == null) {
        const match = patients.find(
          (p) =>
            p.consultorio === consultorio &&
            normalizeNombre(p.nombre_completo) === normalizeNombre(nombre),
        );
        if (match) patientId = match.id;
      }

      let obraSocialId: number | null = null;
      if (data.tipo === "obra_social") {
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
        // Modo edición: si cambió el consultorio del paciente, se actualiza en el
        // paciente (no en el turno). El cambio es retroactivo: todos los turnos
        // pasados de ese paciente se reclasifican bajo el nuevo consultorio en
        // las planillas exportadas, ya que el filtro de exportación se basa en
        // el consultorio actual del paciente.
        if (patientId != null) {
          const pacienteActual = patients.find((p) => p.id === patientId);
          if (pacienteActual && pacienteActual.consultorio !== consultorio) {
            await updatePatient.mutateAsync({ id: patientId, data: { consultorio } });
          }
        }
        await updateAppointment.mutateAsync({
          id: data.id,
          ...base,
          ...(patientId != null ? { patient_id: patientId } : { nombre_completo: nombre }),
        });
        sileo.success({
          title: "Turno actualizado",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        if (patientId == null) {
          const created = await createPatient.mutateAsync({
            nombre_completo: nombre,
            telefono: null,
            obra_social_id: null,
            observaciones: null,
            consultorio,
          });
          patientId = created.id;
        }
        await createAppointment.mutateAsync({ ...base, patient_id: patientId });
        sileo.success({ title: "Turno guardado", description: "El turno se cargó en la agenda." });
      }

      setFormFecha(null);
      setEditingTurno(null);
    } catch (e) {
      sileo.error({
        title: "No se pudo guardar",
        description: e instanceof Error ? e.message : "Revisá los datos e intentá de nuevo.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment.mutateAsync(id);
      setDetalleFecha(null);
      sileo.success({ title: "Turno eliminado", description: "El turno se quitó de la agenda." });
    } catch (e) {
      sileo.error({
        title: "No se pudo eliminar",
        description: e instanceof Error ? e.message : "Revisá los datos e intentá de nuevo.",
      });
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
      sileo.error({
        title: "No se pudo generar",
        description: e instanceof Error ? e.message : "Revisá la conexión e intentá de nuevo.",
      });
    } finally {
      setExportingPlanilla(false);
    }
  };

  const detalleTurnos = detalleFecha ? (turnosPorDia[detalleFecha] ?? []) : [];
  const turnosDelDia = turnosPorDia[selected] ?? [];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl space-y-4 pb-24 md:pb-4">
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
              className="min-h-10 gap-1.5"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">
                {exportingPlanilla ? "Generando..." : "Descargar planilla de sesiones"}
              </span>
              <span className="sm:hidden">{exportingPlanilla ? "..." : "Planilla"}</span>
            </Button>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg bg-card shadow-sm">
          <div className="flex items-center justify-between gap-2 bg-primary px-3 py-2 text-primary-foreground">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => shiftMonth(-1)}
              className="size-9 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <span className="text-sm font-bold tracking-wide uppercase sm:text-base">
              {MESES[month]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => shiftMonth(1)}
              className="size-9 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          {isLoading && (
            <div className="px-3 py-1.5 text-xs text-muted-foreground">Cargando turnos…</div>
          )}
          {!isLoading && error && (
            <div className="bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              No se pudieron cargar los turnos del servidor.
            </div>
          )}

          <CalendarGrid
            year={year}
            month={month}
            turnosPorDia={turnosPorDia}
            onDayClick={(key) => setFormFecha(key)}
            onTurnosClick={(key) => setDetalleFecha(key)}
          />
        </div>


        <div className="flex w-fit flex-wrap items-center gap-2">
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
