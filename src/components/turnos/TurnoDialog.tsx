import { useEffect, useState } from "react";
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
import { ObraSocialCombobox } from "./ObraSocialCombobox";
import { PatientCombobox } from "./PatientCombobox";
import { useObraSociales } from "@/hooks/use-obra-sociales";
import { OBRAS_SOCIALES, formatFechaLarga, type TipoConsulta, type Turno } from "@/lib/turnos";

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
    tipo: TipoConsulta;
    obraSocial?: string;
    observacion?: string;
  }) => void;
}

export function TurnoDialog({ fecha, turno = null, onClose, onSave }: Props) {
  const { data: obrasSociales = [] } = useObraSociales();
  const obraSocialOptions =
    obrasSociales.length > 0 ? obrasSociales.map((o) => o.nombre) : OBRAS_SOCIALES;
  const [hora, setHora] = useState("09:00");
  const [nombreTexto, setNombreTexto] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoConsulta>("particular");
  const [obraSocial, setObraSocial] = useState("");
  const [observacion, setObservacion] = useState("");

  const esEdicion = turno != null;
  const fechaTurno = esEdicion ? turno.fecha : fecha;
  const nombreOriginal = esEdicion ? turno.nombre : "";
  const reasignando = esEdicion && nombreTexto.trim() !== nombreOriginal.trim();

  useEffect(() => {
    if (!turno) return;
    setHora(turno.hora);
    setNombreTexto(turno.nombre);
    setSelectedPatientId(turno.patientId);
    setTipo(turno.tipo);
    setObraSocial(turno.obraSocial ?? "");
    setObservacion(turno.observacion ?? "");
  }, [turno]);

  const reset = () => {
    setHora("09:00");
    setNombreTexto("");
    setSelectedPatientId(null);
    setTipo("particular");
    setObraSocial("");
    setObservacion("");
  };

  const esObraSocial = tipo === "obra_social";
  const puedeGuardar = Boolean(nombreTexto.trim() && hora && (!esObraSocial || obraSocial));

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
            <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido</Label>
            <PatientCombobox
              value={nombreTexto}
              placeholder="Ej: María Gómez"
              onChange={(v) => {
                setNombreTexto(v);
                setSelectedPatientId(null);
              }}
              onSelectPatient={(id, nombrePaciente) => {
                setSelectedPatientId(id);
                setNombreTexto(nombrePaciente);
              }}
            />
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
                value={obraSocial}
                onChange={setObraSocial}
                options={obraSocialOptions}
              />
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
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            disabled={!puedeGuardar}
            onClick={() => {
              onSave({
                ...(esEdicion ? { id: turno.id } : {}),
                fecha: fechaTurno ?? "",
                hora,
                nombre: nombreTexto.trim(),
                ...(selectedPatientId != null ? { patientId: selectedPatientId } : {}),
                tipo,
                ...(esObraSocial ? { obraSocial } : {}),
                ...(observacion.trim() ? { observacion: observacion.trim() } : {}),
              });

              reset();
            }}
          >
            {esEdicion ? "Guardar cambios" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
