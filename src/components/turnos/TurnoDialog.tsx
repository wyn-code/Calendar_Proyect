import { useState } from "react";
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
import { formatFechaLarga, type TipoConsulta } from "@/lib/turnos";

interface Props {
  fecha: string | null;
  onClose: () => void;
  onSave: (data: {
    hora: string;
    nombre: string;
    tipo: TipoConsulta;
    obraSocial?: string;
    observacion?: string;
  }) => void;
}

export function TurnoDialog({ fecha, onClose, onSave }: Props) {
  const [hora, setHora] = useState("09:00");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoConsulta>("particular");
  const [obraSocial, setObraSocial] = useState("");
  const [observacion, setObservacion] = useState("");

  const reset = () => {
    setHora("09:00");
    setNombre("");
    setTipo("particular");
    setObraSocial("");
    setObservacion("");
  };

  const esObraSocial = tipo === "obra_social";
  const puedeGuardar = Boolean(nombre.trim() && hora && (!esObraSocial || obraSocial));



  return (
    <Dialog
      open={fecha !== null}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
          <DialogDescription>{fecha ? formatFechaLarga(fecha) : ""}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hora">Horario de inicio</Label>
            <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido</Label>
            <Input
              id="nombre"
              placeholder="Ej: María Gómez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="off"
            />
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
              <ObraSocialCombobox value={obraSocial} onChange={setObraSocial} />
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
                hora,
                nombre: nombre.trim(),
                tipo,
                ...(esObraSocial ? { obraSocial } : {}),
              });
              reset();
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
