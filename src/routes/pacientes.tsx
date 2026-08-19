import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Upload } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FacturaUploadFlow } from "@/components/facturas/FacturaUploadFlow";
import { formatFechaCorta, type CoberturaMock } from "@/lib/mock-data";
import { useMockStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes | Calendar Pro" },
      {
        name: "description",
        content:
          "Listado de pacientes con obra social, sesiones del mes y última factura cargada, con carga rápida de facturas.",
      },
      { property: "og:title", content: "Pacientes | Calendar Pro" },
      {
        property: "og:description",
        content: "Buscá pacientes, filtrá por cobertura y subí facturas en un toque.",
      },
    ],
  }),
  component: PacientesPage,
});

const FILTROS = ["Todos", "Particular", "Obra Social"] as const;

function PacientesPage() {
  const { pacientes, registrarFactura, filtroConsultorio } = useMockStore();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todos");
  const [facturaPara, setFacturaPara] = useState<string | null>(null);

  const visibles = useMemo(
    () =>
      pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q.trim().toLowerCase()) &&
          (filtro === "Todos" || p.cobertura === (filtro as CoberturaMock)) &&
          (filtroConsultorio === "Todos" || p.consultorio === filtroConsultorio),
      ),
    [pacientes, q, filtro, filtroConsultorio],
  );

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl space-y-4 pb-10">
        <PageHeader title="Pacientes" subtitle={`${visibles.length} pacientes en vista`} />
        <ConsultorioFilter />

        <div className="space-y-3 rounded-lg bg-card/90 p-3 shadow-sm backdrop-blur-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="min-h-11 pl-9"
              placeholder="Buscar por nombre"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filtro === f ? "default" : "outline"}
                className="min-h-10"
                onClick={() => setFiltro(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile: tarjetas apiladas */}
        <div className="space-y-3 md:hidden">
          {visibles.map((p) => (
            <div key={p.id} className="rounded-lg bg-card/90 p-3 shadow-sm backdrop-blur-sm">
              <h2 className="text-sm font-bold">{p.nombre}</h2>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                <dt>DNI</dt>
                <dd className="text-right text-foreground">{p.dni}</dd>
                <dt>Cobertura</dt>
                <dd className="text-right text-foreground">{p.obraSocial ?? "Particular"}</dd>
                <dt>Sesiones este mes</dt>
                <dd className="text-right text-foreground">{p.sesionesMes}</dd>
                <dt>Última factura</dt>
                <dd
                  className={cn("text-right", p.ultimaFactura ? "text-foreground" : "italic")}
                >
                  {formatFechaCorta(p.ultimaFactura)}
                </dd>
              </dl>
              <Button
                className="mt-3 min-h-11 w-full"
                size="sm"
                onClick={() => setFacturaPara(p.nombre)}
              >
                <Upload className="size-4" /> Subir factura
              </Button>
            </div>
          ))}
          {visibles.length === 0 && (
            <p className="rounded-lg bg-card/90 p-6 text-center text-sm text-muted-foreground backdrop-blur-sm">
              No hay pacientes que coincidan.
            </p>
          )}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden overflow-hidden rounded-lg bg-card/95 shadow-sm backdrop-blur-sm md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre y apellido</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Obra Social</TableHead>
                <TableHead className="text-center">Sesiones este mes</TableHead>
                <TableHead>Última factura</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{p.dni}</TableCell>
                  <TableCell>{p.obraSocial ?? "Particular"}</TableCell>
                  <TableCell className="text-center">{p.sesionesMes}</TableCell>
                  <TableCell className={cn(!p.ultimaFactura && "text-muted-foreground italic")}>
                    {formatFechaCorta(p.ultimaFactura)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setFacturaPara(p.nombre)}>
                      <Upload className="size-4" /> Subir factura
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visibles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay pacientes que coincidan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={facturaPara !== null} onOpenChange={(o) => !o && setFacturaPara(null)}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Subir factura · {facturaPara}</DialogTitle>
          </DialogHeader>
          {facturaPara && (
            <FacturaUploadFlow
              key={facturaPara}
              pacienteInicial={facturaPara}
              consultorioInicial={
                pacientes.find((p) => p.nombre === facturaPara)?.consultorio ?? ""
              }
              onGuardado={(nombre, sesiones, fecha) => registrarFactura(nombre, sesiones, fecha)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
