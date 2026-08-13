import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ObraSocialCombobox } from "./ObraSocialCombobox";
import { PatientCombobox } from "./PatientCombobox";
import { useObraSociales } from "@/hooks/use-obra-sociales";
import { usePatients } from "@/hooks/use-patients";
import { OBRAS_SOCIALES, formatFechaLarga, type TipoConsulta, type Turno } from "@/lib/turnos";
import type { Consultorio } from "@/lib/api";

interface Props {
  fecha: string | null;
  turno?: Turno | null;
  onClose: () => void;
  onSave: (data: {
    id?: number;
    fecha: string;
    hora: string;
    nombre: string;
    patientId?: number | null;
    consultorio?: Consultorio | null;
    tipo: TipoConsulta;
    obraSocial?: string;
    observacion?: string;
  }) => void;
}

export function TurnoDialog({ fecha, turno = null, onClose, onSave }: Props) {
  const { data: obrasSociales = [] } = useObraSociales();
  const { data: patients = [] } = usePatients();
  const obraSocialOptions =
    obrasSociales.length > 0 ? obrasSociales.map((o) => o.nombre) : OBRAS_SOCIALES;
  const [hora, setHora] = useState("09:00");
  const [nombreTexto, setNombreTexto] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [consultorio, setConsultorio] = useState<Consultorio | null>(null);
  const [tipo, setTipo] = useState<TipoConsulta>("particular");
  const [obraSocial, setObraSocial] = useState("");
  const [observacion, setObservacion] = useState("");
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [confirmarMovimiento, setConfirmarMovimiento] = useState(false);

  const esEdicion = turno != null;
  const fechaTurno = esEdicion ? turno.fecha : fecha;
  const nombreOriginal = esEdicion ? turno.nombre : "";
  const reasignando = esEdicion && nombreTexto.trim() !== nombreOriginal.trim();

  const pacientesPorConsultorio = useMemo(
    () => patients.filter((p) => p.consultorio === consultorio),
    [patients, consultorio],
  );
  const pacientesVisibles = esEdicion ? patients : pacientesPorConsultorio;

  useEffect(() => {
    if (!turno) return;
    const paciente = patients.find((p) => p.id === turno.patientId);
    setHora(turno.hora);
    setNombreTexto(turno.nombre);
    setSelectedPatientId(turno.patientId);
    if (paciente) setConsultorio(paciente.consultorio);
    setTipo(turno.tipo);
    setObraSocial(turno.obraSocial ?? "");
    setObservacion(turno.observacion ?? "");
  }, [turno, patients]);

  const reset = () => {
    setHora("09:00");
    setNombreTexto("");
    setSelectedPatientId(null);
    setConsultorio(null);
    setTipo("particular");
    setObraSocial("");
    setObservacion("");
    setMostrarErrores(false);
    setConfirmarMovimiento(false);
  };

  const consultorioBloqueado = selectedPatientId != null;
  const esObraSocial = tipo === "obra_social";

  const pacienteActual =
    esEdicion && selectedPatientId != null
      ? (patients.find((p) => p.id === selectedPatientId) ?? null)
      : null;
  const consultorioCambiado =
    pacienteActual != null && consultorio != null && consultorio !== pacienteActual.consultorio;

  const errores = useMemo(() => {
    const errs: {
      hora?: string;
      consultorio?: string;
      nombre?: string;
      obraSocial?: string;
    } = {};
    if (!hora) errs.hora = "Seleccioná el horario de inicio.";
    if (!consultorio) errs.consultorio = "Seleccioná un consultorio.";
    if (!nombreTexto.trim()) errs.nombre = "Ingresá el nombre y apellido del paciente.";
    if (esObraSocial && !obraSocial) errs.obraSocial = "Seleccioná una obra social.";
    return errs;
  }, [hora, consultorio, nombreTexto, esObraSocial, obraSocial]);

  const mostrarError = (campo: keyof typeof errores) => mostrarErrores && errores[campo];

  const focusPrimerError = () => {
    if (errores.hora) {
      document.getElementById("hora")?.focus();
      return;
    }
    if (errores.consultorio) {
      document.getElementById("c-neurovital")?.focus();
      return;
    }
    if (errores.nombre) {
      document.getElementById("paciente-input")?.focus();
      return;
    }
    if (errores.obraSocial) {
      document.getElementById("obra-social-trigger")?.focus();
    }
  };

  const handleSubmit = () => {
    if (Object.keys(errores).length > 0) {
      setMostrarErrores(true);
      focusPrimerError();
      return;
    }
    if (consultorioCambiado && !confirmarMovimiento) {
      setMostrarErrores(false);
      setConfirmarMovimiento(true);
      return;
    }
    setMostrarErrores(false);
    onSave({
      ...(esEdicion ? { id: turno.id } : {}),
      fecha: fechaTurno ?? "",
      hora,
      nombre: nombreTexto.trim(),
      ...(selectedPatientId != null ? { patientId: selectedPatientId } : {}),
      consultorio,
      tipo,
      ...(esObraSocial ? { obraSocial } : {}),
      ...(observacion.trim() ? { observacion: observacion.trim() } : {}),
    });
    reset();
  };

  const pillClase =
    "flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <Dialog
      open={fecha !== null || turno !== null}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar turno" : "Nuevo turno"}</DialogTitle>
          <DialogDescription>{fechaTurno ? formatFechaLarga(fechaTurno) : ""}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hora">Horario de inicio</Label>
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              aria-invalid={mostrarError("hora") ? true : undefined}
              className={cn(
                mostrarError("hora") && "border-destructive focus-visible:ring-destructive",
              )}
            />
            {mostrarError("hora") && <p className="text-xs text-destructive">{errores.hora}</p>}
          </div>

          <div className="space-y-2">
            <Label>Consultorio</Label>
            <RadioGroup
              value={consultorio ?? ""}
              onValueChange={(v) => {
                setConsultorio(v as Consultorio);
                setConfirmarMovimiento(false);
              }}
              disabled={!esEdicion && consultorioBloqueado}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="c-neurovital"
                className={cn(
                  pillClase,
                  mostrarError("consultorio") &&
                    "border-destructive has-[button[data-state=checked]]:border-destructive",
                )}
              >
                <RadioGroupItem value="Neurovital" id="c-neurovital" />
                Neurovital
              </Label>
              <Label
                htmlFor="c-infancias"
                className={cn(
                  pillClase,
                  mostrarError("consultorio") &&
                    "border-destructive has-[button[data-state=checked]]:border-destructive",
                )}
              >
                <RadioGroupItem value="Infancias" id="c-infancias" />
                Infancias
              </Label>
            </RadioGroup>
            {mostrarError("consultorio") && (
              <p className="text-xs text-destructive">{errores.consultorio}</p>
            )}
            {!esEdicion && consultorioBloqueado && (
              <p className="text-xs text-muted-foreground">
                Este paciente pertenece a {consultorio}. Para cambiarlo, deseleccioná el paciente.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paciente-input">Nombre y apellido</Label>
            <PatientCombobox
              id="paciente-input"
              value={nombreTexto}
              placeholder={
                esEdicion || consultorio ? "Ej: María Gómez" : "Seleccioná un consultorio primero"
              }
              disabled={!esEdicion && !consultorio}
              pacientes={pacientesVisibles}
              error={!!mostrarError("nombre")}
              onChange={(v) => {
                setNombreTexto(v);
                setSelectedPatientId(null);
                setConfirmarMovimiento(false);
              }}
              onSelectPatient={(id, nombrePaciente) => {
                setSelectedPatientId(id);
                setNombreTexto(nombrePaciente);
                const paciente = patients.find((p) => p.id === id);
                if (paciente) setConsultorio(paciente.consultorio);
                setConfirmarMovimiento(false);
              }}
            />
            {mostrarError("nombre") && <p className="text-xs text-destructive">{errores.nombre}</p>}
            {!esEdicion && !consultorio && (
              <p className="text-xs text-muted-foreground">
                Seleccioná un consultorio para buscar o cargar un paciente.
              </p>
            )}
            {reasignando && (
              <p className="text-xs text-muted-foreground">
                Este turno se reasignará a un paciente distinto.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de consulta</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as TipoConsulta)}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="t-part"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent"
              >
                <RadioGroupItem value="particular" id="t-part" />
                Particular
              </Label>
              <Label
                htmlFor="t-os"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent"
              >
                <RadioGroupItem value="obra_social" id="t-os" />
                Obra Social
              </Label>
            </RadioGroup>
          </div>

          {esObraSocial && (
            <div className="animate-in fade-in slide-in-from-top-1 space-y-1.5 duration-300">
              <Label>Obra social</Label>
              <ObraSocialCombobox
                triggerId="obra-social-trigger"
                value={obraSocial}
                onChange={setObraSocial}
                options={obraSocialOptions}
                error={!!mostrarError("obraSocial")}
              />
              {mostrarError("obraSocial") && (
                <p className="text-xs text-destructive">{errores.obraSocial}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              placeholder="Notas del turno (opcional)"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {confirmarMovimiento ? (
            <>
              <p className="w-full text-center text-xs text-muted-foreground">
                Vas a mover a este paciente a{" "}
                <span className="font-medium text-foreground">{consultorio}</span>. Todos sus turnos
                pasados se reclasificarán en las planillas.
              </p>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmarMovimiento(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  Confirmar y guardar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>{esEdicion ? "Guardar cambios" : "Guardar"}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
