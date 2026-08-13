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
import { ObraSocialCombobox } from "@/components/turnos/ObraSocialCombobox";
import type { Consultorio, ObraSocial, Patient, PatientUpdate } from "@/lib/api";

interface Props {
  patient: Patient | null;
  obrasSociales: ObraSocial[];
  onClose: () => void;
  onSave: (data: PatientUpdate) => void;
}

export function PatientEditDialog({ patient, obrasSociales, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [consultorio, setConsultorio] = useState<Consultorio>("Neurovital");
  const [observaciones, setObservaciones] = useState("");

  const obraSocialOptions = useMemo(() => obrasSociales.map((o) => o.nombre), [obrasSociales]);

  useEffect(() => {
    if (!patient) return;
    setNombre(patient.nombre_completo);
    setTelefono(patient.telefono ?? "");
    setObraSocial(
      patient.obra_social_id != null
        ? (obrasSociales.find((o) => o.id === patient.obra_social_id)?.nombre ?? "")
        : "",
    );
    setConsultorio(patient.consultorio ?? "Neurovital");
    setObservaciones(patient.observaciones ?? "");
  }, [patient, obrasSociales]);

  const reset = () => {
    setNombre("");
    setTelefono("");
    setObraSocial("");
    setConsultorio("Neurovital");
    setObservaciones("");
  };

  const puedeGuardar = Boolean(nombre.trim() && consultorio);

  const handleSave = () => {
    if (!puedeGuardar) return;
    const obraSocialEncontrada = obraSocialOptions.find(
      (o) => o.trim().toLowerCase() === obraSocial.trim().toLowerCase(),
    );
    const obraSocialId = obraSocialEncontrada
      ? (obrasSociales.find((o) => o.nombre === obraSocialEncontrada)?.id ?? null)
      : null;
    onSave({
      nombre_completo: nombre.trim(),
      telefono: telefono.trim() ? telefono.trim() : null,
      obra_social_id: obraSocialId,
      observaciones: observaciones.trim() ? observaciones.trim() : null,
      consultorio,
    });
    reset();
  };

  const pillClase =
    "flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent";

  return (
    <Dialog
      open={patient != null}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
          <DialogDescription>{patient?.nombre_completo ?? ""}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Consultorio</Label>
            <RadioGroup
              value={consultorio}
              onValueChange={(v) => setConsultorio(v as Consultorio)}
              className="grid grid-cols-2 gap-2"
            >
              <Label htmlFor="pc-neurovital" className={pillClase}>
                <RadioGroupItem value="Neurovital" id="pc-neurovital" />
                Neurovital
              </Label>
              <Label htmlFor="pc-infancias" className={pillClase}>
                <RadioGroupItem value="Infancias" id="pc-infancias" />
                Infancias
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Obra social</Label>
            <ObraSocialCombobox
              value={obraSocial}
              onChange={setObraSocial}
              options={obraSocialOptions}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
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
          <Button disabled={!puedeGuardar} onClick={handleSave}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
