import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Camera, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFactura, type FacturaCreate } from "@/hooks/use-facturas";

type Estado = "inicial" | "procesando" | "revision" | "exito" | "error";

const DATOS_LEIDOS = {
  dni: "38.412.905",
  obraSocial: "OSDE",
  nroAfiliado: "6109-4432/01",
  periodo: "Agosto 2026",
  fechaEmision: "2026-08-18",
  nroFactura: "0003-00014521",
  sesiones: "4",
  monto: "80511.80",
  porcentaje: "",
  fechaPago: "",
};

interface Props {
  pacienteInicial?: string;
  consultorioInicial?: string;
}

export function FacturaUploadFlow({ pacienteInicial = "", consultorioInicial = "" }: Props) {
  const [estado, setEstado] = useState<Estado>("inicial");
  const [form, setForm] = useState({
    paciente: pacienteInicial,
    consultorio: consultorioInicial,
    dni: "",
    obraSocial: "",
    nroAfiliado: "",
    periodo: "",
    fechaEmision: "",
    nroFactura: "",
    sesiones: "",
    monto: "",
    porcentaje: "",
    fechaPago: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fallosRef = useRef(0);
  const crearFactura = useCreateFactura();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const procesar = () => {
    setEstado("procesando");
    setTimeout(() => {
      fallosRef.current += 1;
      if (fallosRef.current % 3 === 0) {
        setForm({
          paciente: pacienteInicial,
          consultorio: consultorioInicial,
          dni: "",
          obraSocial: "",
          nroAfiliado: "",
          periodo: "",
          fechaEmision: "",
          nroFactura: "",
          sesiones: "",
          monto: "",
          porcentaje: "",
          fechaPago: "",
        });
        setEstado("error");
      } else {
        setForm({
          ...DATOS_LEIDOS,
          paciente: pacienteInicial || "Camila Rossi",
          consultorio: consultorioInicial || "Neurovital",
        });
        setEstado("revision");
      }
    }, 1500);
  };

  const reset = (next: Estado = "inicial") => {
    setForm({
      paciente: pacienteInicial,
      consultorio: consultorioInicial,
      dni: "",
      obraSocial: "",
      nroAfiliado: "",
      periodo: "",
      fechaEmision: "",
      nroFactura: "",
      sesiones: "",
      monto: "",
      porcentaje: "",
      fechaPago: "",
    });
    setEstado(next);
  };

  const confirmar = () => {
    const payload: FacturaCreate = {
      paciente_nombre: form.paciente,
      consultorio: form.consultorio,
      sesiones: Number(form.sesiones) || 0,
      monto: Number(form.monto) || 0,
    };
    if (form.dni) payload.dni = form.dni;
    if (form.obraSocial) payload.obra_social = form.obraSocial;
    if (form.nroAfiliado) payload.nro_afiliado = form.nroAfiliado;
    if (form.periodo) payload.periodo = form.periodo;
    if (form.fechaEmision) payload.fecha_emision = form.fechaEmision;
    if (form.nroFactura) payload.nro_factura = form.nroFactura;
    if (form.porcentaje) payload.porcentaje = Number(form.porcentaje);
    if (form.fechaPago) payload.fecha_pago = form.fechaPago;

    crearFactura.mutate(payload, {
      onSuccess: () => setEstado("exito"),
      onError: () => setEstado("error"),
    });
  };

  const focusScroll = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
  };

  if (estado === "inicial") {
    return (
      <div className="rounded-lg border-2 border-dashed border-primary/40 bg-card/85 p-6 text-center backdrop-blur-sm">
        <FileUp className="mx-auto size-10 text-primary" />
        <p className="mt-3 text-base font-semibold">Subí la factura (PDF o foto)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Arrastrá el archivo o elegilo desde tu dispositivo
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button className="min-h-11" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4" /> Elegir archivo
          </Button>
          <Button variant="outline" className="min-h-11" onClick={() => cameraRef.current?.click()}>
            <Camera className="size-4" /> Tomar foto
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={procesar}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={procesar}
        />
      </div>
    );
  }

  if (estado === "procesando") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-card/85 p-10 backdrop-blur-sm">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Leyendo la factura...</p>
      </div>
    );
  }

  if (estado === "exito") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-card/85 p-10 text-center backdrop-blur-sm">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-base font-semibold">Factura guardada</p>
        <p className="text-xs text-muted-foreground">Los datos se registraron correctamente.</p>
        <Button className="min-h-11" onClick={() => reset("inicial")}>
          Cargar otra factura
        </Button>
      </div>
    );
  }

  const campos: Array<{
    key: string;
    label: string;
    type?: string;
    numeric?: boolean;
  }> = [
    { key: "paciente", label: "Paciente" },
    { key: "consultorio", label: "Consultorio" },
    { key: "dni", label: "DNI", numeric: true },
    { key: "obraSocial", label: "Obra Social" },
    { key: "nroAfiliado", label: "N° Afiliado" },
    { key: "periodo", label: "Periodo facturado" },
    { key: "fechaEmision", label: "Fecha de emisión", type: "date" },
    { key: "nroFactura", label: "N° de factura" },
    { key: "sesiones", label: "Cantidad de sesiones", numeric: true },
    { key: "monto", label: "Monto facturado ($ARS)", numeric: true },
    { key: "porcentaje", label: "Porcentaje a abonar (%)", numeric: true },
    { key: "fechaPago", label: "Fecha de pago", type: "date" },
  ];

  return (
    <div className="rounded-lg bg-card/90 backdrop-blur-sm">
      {estado === "error" && (
        <div className="flex items-start gap-2 rounded-t-lg bg-destructive/10 px-4 py-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>No pudimos leer los datos automáticamente. Completá la factura a mano.</span>
        </div>
      )}
      <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
        {campos.map((c) => (
          <div key={c.key} className="space-y-1.5">
            <Label htmlFor={`f-${c.key}`}>{c.label}</Label>
            <Input
              id={`f-${c.key}`}
              className="min-h-11"
              type={c.type ?? "text"}
              inputMode={c.numeric ? "numeric" : undefined}
              value={form[c.key as keyof typeof form]}
              onChange={set(c.key)}
              onFocus={focusScroll}
            />
          </div>
        ))}
      </div>
      <div
        className="sticky bottom-0 flex gap-2 rounded-b-lg border-t bg-card px-4 py-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <Button variant="outline" className="min-h-11 flex-1" onClick={() => reset("inicial")}>
          Cancelar
        </Button>
        <Button className="min-h-11 flex-1" disabled={crearFactura.isPending} onClick={confirmar}>
          {crearFactura.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Confirmar y guardar"
          )}
        </Button>
      </div>
    </div>
  );
}
