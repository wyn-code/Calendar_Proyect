import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { sileo } from "sileo";
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
import { usePatients, useUpdatePatient } from "@/hooks/use-patients";
import { PageShell } from "@/components/layout/PageShell";
import { CoberturaBadge } from "@/components/turnos/CoberturaBadge";
import { PatientEditDialog } from "@/components/pacientes/PatientEditDialog";
import type { Patient } from "@/lib/api";

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
  const updatePatient = useUpdatePatient();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const obraSocialPorId = useMemo(
    () => new Map(obrasSociales.map((o) => [o.id, o.nombre])),
    [obrasSociales],
  );

  const pacientesOrdenados = useMemo(
    () => [...patients].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, "es")),
    [patients],
  );

  const handleSave = async (data: Parameters<typeof updatePatient.mutateAsync>[0]["data"]) => {
    if (!editingPatient) return;
    try {
      await updatePatient.mutateAsync({ id: editingPatient.id, data });
      sileo.success({
        title: "Paciente actualizado",
        description: "Los datos del paciente se guardaron.",
      });
      setEditingPatient(null);
    } catch (e) {
      sileo.error({
        title: "No se pudo actualizar",
        description: e instanceof Error ? e.message : "Revisá los datos e intentá de nuevo.",
      });
    }
  };

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
                <TableHead>Consultorio</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Obra social</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    Cargando pacientes…
                  </TableCell>
                </TableRow>
              ) : pacientesOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
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
                      <TableCell>
                        <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium">
                          {p.consultorio}
                        </span>
                      </TableCell>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label={`Editar a ${p.nombre_completo}`}
                          onClick={() => setEditingPatient(p)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PatientEditDialog
        patient={editingPatient}
        obrasSociales={obrasSociales}
        onClose={() => setEditingPatient(null)}
        onSave={handleSave}
      />
    </PageShell>
  );
}
