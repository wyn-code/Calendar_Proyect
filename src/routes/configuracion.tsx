import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useConsultorios,
  useCreateConsultorio,
  useUpdateConsultorio,
  useDeleteConsultorio,
} from "@/hooks/use-consultorios";
import { usePrecios, useSetPrecio } from "@/hooks/use-config";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración | Calendar Pro" },
      {
        name: "description",
        content: "Administrá tus consultorios y los precios por tipo de consulta.",
      },
      { property: "og:title", content: "Configuración | Calendar Pro" },
      {
        property: "og:description",
        content: "Consultorios y precios de Particular, Obra Social y Discapacidad.",
      },
    ],
  }),
  component: ConfiguracionPage,
});

const PRECIO_KEYS = ["particular", "obra_social", "discapacidad"] as const;
const PRECIO_LABELS: Record<string, string> = {
  particular: "Particular",
  obra_social: "Obra Social",
  discapacidad: "Discapacidad",
};

function ConfiguracionPage() {
  const { data: consultorios = [], isLoading } = useConsultorios();
  const { data: precios } = usePrecios();
  const createCons = useCreateConsultorio();
  const updateCons = useUpdateConsultorio();
  const deleteCons = useDeleteConsultorio();
  const setPrecio = useSetPrecio();

  const [nuevo, setNuevo] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [aEliminar, setAEliminar] = useState<{ id: number; nombre: string } | null>(null);
  const [borrador, setBorrador] = useState<Record<string, string>>({});

  const preciosDefault = precios ?? { particular: 20000, obra_social: 15000, discapacidad: 12000 };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Configuración" subtitle="Consultorios y precios" />
        <ConsultorioFilter />

        <section className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Consultorios</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {consultorios.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-3 py-2"
                >
                  {editId === c.id ? (
                    <Input
                      className="min-h-11"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="truncate text-sm font-medium">{c.nombre}</span>
                  )}
                  <div className="flex shrink-0 gap-1">
                    {editId === c.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Guardar"
                          className="size-10"
                          onClick={() => {
                            if (editNombre.trim()) {
                              updateCons.mutate({ id: c.id, data: { nombre: editNombre.trim() } });
                            }
                            setEditId(null);
                          }}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Cancelar"
                          className="size-10"
                          onClick={() => setEditId(null)}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar ${c.nombre}`}
                          className="size-10"
                          onClick={() => {
                            setEditId(c.id);
                            setEditNombre(c.nombre);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Eliminar ${c.nombre}`}
                          className="size-10 text-destructive"
                          onClick={() => setAEliminar({ id: c.id, nombre: c.nombre })}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-2">
            <Input
              className="min-h-11"
              placeholder="Nuevo consultorio"
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
            />
            <Button
              className="min-h-11 shrink-0"
              disabled={createCons.isPending}
              onClick={() => {
                if (!nuevo.trim()) return;
                createCons.mutate({ nombre: nuevo.trim() }, { onSuccess: () => setNuevo("") });
              }}
            >
              <Plus className="size-4" /> Agregar
            </Button>
          </div>
        </section>

        <section className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Precios por tipo de consulta</h2>
          <p className="text-xs text-muted-foreground">Se guardan al salir del campo.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PRECIO_KEYS.map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`precio-${key}`}>{PRECIO_LABELS[key]} ($ARS)</Label>
                <Input
                  id={`precio-${key}`}
                  className="min-h-11"
                  inputMode="numeric"
                  value={
                    borrador[key] ?? String(preciosDefault[key as keyof typeof preciosDefault])
                  }
                  onChange={(e) => setBorrador((p) => ({ ...p, [key]: e.target.value }))}
                  onBlur={(e) => {
                    const val = Number(e.target.value) || 0;
                    setPrecio.mutate({ clave: key, valor: val });
                    setBorrador((p) => {
                      const next = { ...p };
                      delete next[key];
                      return next;
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={aEliminar !== null} onOpenChange={(o) => !o && setAEliminar(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar consultorio</DialogTitle>
            <DialogDescription>
              ¿Seguro que querés eliminar «{aEliminar?.nombre}»? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="min-h-11"
              disabled={deleteCons.isPending}
              onClick={() => {
                if (aEliminar) deleteCons.mutate(aEliminar.id);
                setAEliminar(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
