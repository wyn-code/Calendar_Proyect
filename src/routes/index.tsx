import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import { FileText } from "lucide-react";
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
import {
  MESES,
  appointmentsToTurnos,
  toKey,
  fromKey,
  addDays,
  weekDays,
  formatFechaLarga,
  type TipoConsulta,
  type Turno,
} from "@/lib/turnos";
import { PageShell } from "@/components/layout/PageShell";
import { CoberturaBadge } from "@/components/turnos/CoberturaBadge";
import { ViewSwitcher, type Vista } from "@/components/turnos/ViewSwitcher";
import { CalendarHeader } from "@/components/turnos/CalendarHeader";
import { DayAgenda } from "@/components/turnos/DayAgenda";
import { WeekStrip } from "@/components/turnos/WeekStrip";
import { TurnoSheet } from "@/components/turnos/TurnoSheet";
import { AddTurnoFab } from "@/components/turnos/AddTurnoFab";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSwipe } from "@/hooks/use-swipe";

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
  const [selected, setSelected] = useState(() => toKey(today));
  const [vista, setVista] = useState<Vista>("mes");
  const [formFecha, setFormFecha] = useState<string | null>(null);
  const [detalleFecha, setDetalleFecha] = useState<string | null>(null);
  const [turnoSheet, setTurnoSheet] = useState<Turno | null>(null);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [exportingPlanilla, setExportingPlanilla] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  const selectedDate = fromKey(selected);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) setLoginOpen(true);
  }, [mounted]);

  // Vista por defecto: día en mobile, mes en desktop.
  useEffect(() => {
    setVista(isMobile ? "dia" : "mes");
  }, [isMobile]);

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
    setSelected(toKey(d));
  };

  const navigate = (delta: number) => {
    if (vista === "mes") shiftMonth(delta);
    else setSelected(toKey(addDays(selectedDate, vista === "semana" ? delta * 7 : delta)));
  };

  const swipe = useSwipe(
    () => navigate(1),
    () => navigate(-1),
  );

  const headerLabel =
    vista === "mes"
      ? `${MESES[month]} ${year}`
      : vista === "semana"
        ? (() => {
            const days = weekDays(selectedDate);
            const a = days[0]!;
            const b = days[6]!;
            return `${a.getDate()} – ${b.getDate()} ${MESES[b.getMonth()]}`;
          })()
        : formatFechaLarga(selected);

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
      setTurnoSheet(null);
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

        <div className="sticky top-0 z-30 space-y-2 rounded-lg bg-card/95 p-2 shadow-sm backdrop-blur-md">
          <CalendarHeader
            label={headerLabel}
            selected={selected}
            onPrev={() => navigate(-1)}
            onNext={() => navigate(1)}
            onToday={() => setSelected(toKey(new Date()))}
            onPick={(key) => setSelected(key)}
          />
          <ViewSwitcher value={vista} onChange={setVista} />
        </div>

        {isLoading && (
          <div className="rounded-lg bg-card/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
            Cargando turnos…
          </div>
        )}
        {!isLoading && error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            No se pudieron cargar los turnos del servidor.
          </div>
        )}

        <div
          key={vista}
          className="animate-in fade-in-0 space-y-3 duration-300"
          onPointerDown={swipe.onPointerDown}
          onPointerUp={swipe.onPointerUp}
        >
          {vista === "dia" && (
            <DayAgenda
              turnos={turnosDelDia}
              onSelect={(t) => setTurnoSheet(t)}
              onAdd={() => setFormFecha(selected)}
            />
          )}

          {vista === "semana" && (
            <>
              <WeekStrip
                days={weekDays(selectedDate)}
                selected={selected}
                turnosPorDia={turnosPorDia}
                onSelect={setSelected}
              />
              <DayAgenda
                turnos={turnosDelDia}
                onSelect={(t) => setTurnoSheet(t)}
                onAdd={() => setFormFecha(selected)}
              />
            </>
          )}

          {vista === "mes" && (
            <div className="overflow-hidden rounded-lg bg-card">
              <CalendarGrid
                year={year}
                month={month}
                turnosPorDia={turnosPorDia}
                compact={isMobile}
                onDayClick={(key) => {
                  if (isMobile) {
                    setSelected(key);
                    setVista("dia");
                  } else {
                    setFormFecha(key);
                  }
                }}
                onTurnosClick={(key: string) => {
                  if (isMobile) {
                    setSelected(key);
                    setVista("dia");
                  } else {
                    setDetalleFecha(key);
                  }
                }}
              />
            </div>
          )}
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

      <AddTurnoFab onClick={() => setFormFecha(selected)} />

      <TurnoDialog
        fecha={formFecha}
        turno={editingTurno}
        onClose={() => {
          setFormFecha(null);
          setEditingTurno(null);
        }}
        onSave={handleSave}
      />
      <TurnoSheet
        turno={turnoSheet}
        onClose={() => setTurnoSheet(null)}
        onEdit={(t) => {
          setTurnoSheet(null);
          setEditingTurno(t);
        }}
        onDelete={handleDelete}
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
