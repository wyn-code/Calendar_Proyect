import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useObraSociales } from "@/hooks/use-obra-sociales";
import { usePatients } from "@/hooks/use-patients";
import { PageShell } from "@/components/layout/PageShell";
import { CoberturaBadge } from "@/components/turnos/CoberturaBadge";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes | Agenda de Turnos" },
      {
        name: "description",
        content: "Listado de pacientes de la agenda con su obra social.",
      },
    ],
  }),
  component: Pacientes,
});

function Pacientes() {
  const { data: patients = [], isLoading } = usePatients();
  const { data: obrasSociales = [] } = useObraSociales();

  const obraSocialPorId = useMemo(
    () => new Map(obrasSociales.map((o) => [o.id, o.nombre])),
    [obrasSociales],
  );

  const pacientesOrdenados = useMemo(
    () => [...patients].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, "es")),
    [patients],
  );

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <header className="flex items-center justify-between gap-3 rounded-lg bg-card/85 px-4 py-2.5 shadow-sm backdrop-blur-sm">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 truncate text-lg font-bold tracking-tight sm:text-2xl">
              <Users className="size-5 shrink-0" />
              Pacientes
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {patients.length > 0
                ? `${patients.length} paciente${patients.length === 1 ? "" : "s"} cargado${patients.length === 1 ? "" : "s"}`
                : "Listado de pacientes"}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Volver al calendario
            </Link>
          </Button>
        </header>

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Obra social</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                    Cargando pacientes…
                  </TableCell>
                </TableRow>
              ) : pacientesOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                    No hay pacientes cargados.
                  </TableCell>
                </TableRow>
              ) : (
                pacientesOrdenados.map((p) => {
                  const obraSocial =
                    p.obra_social_id != null ? obraSocialPorId.get(p.obra_social_id) : undefined;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nombre_completo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.telefono?.trim() ? p.telefono : "-"}
                      </TableCell>
                      <TableCell>
                        {obraSocial ? (
                          <CoberturaBadge tipo="obra_social" label={obraSocial} />
                        ) : (
                          <span className="text-muted-foreground">Sin obra social</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {p.observaciones?.trim() ? p.observaciones : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageShell>
  );
}
