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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle2 } from "lucide-react";
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
  }) => void;
}

export function TurnoDialog({ fecha, onClose, onSave }: Props) {
  const [hora, setHora] = useState("09:00");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoConsulta>("particular");
  const [obraSocial, setObraSocial] = useState("");

  const reset = () => {
    setHora("09:00");
    setNombre("");
    setTipo("particular");
    setObraSocial("");
  };

  const esObraSocial = tipo === "obra_social";
  const puedeGuardar = Boolean(nombre.trim() && hora && (!esObraSocial || obraSocial));

  const cerrarSesion = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("turnos-sesion");
    window.location.reload();
  };

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
            <div className="flex items-center gap-2">
              <RadioGroup
                value={tipo}
                onValueChange={(v) => setTipo(v as TipoConsulta)}
                className="grid flex-1 grid-cols-2 gap-2"
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Cuenta"
                    className="shrink-0 text-muted-foreground"
                  >
                    <UserCircle2 className="size-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={cerrarSesion}>
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {esObraSocial && (
            <div className="animate-fade-in space-y-1.5">
              <Label>Obra social</Label>
              <ObraSocialCombobox value={obraSocial} onChange={setObraSocial} />
            </div>
          )}
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
