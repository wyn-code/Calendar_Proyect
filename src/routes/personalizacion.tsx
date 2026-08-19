import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ImagePlus, RotateCcw } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import fondoFloral from "@/assets/fondo-floral.jpg";
import { COLORES_MOCK, TEMA_DEFAULT, type TemaMock } from "@/lib/mock-data";
import { useMockStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personalizacion")({
  head: () => ({
    meta: [
      { title: "Personalización | Calendar Pro" },
      {
        name: "description",
        content:
          "Elegí el color principal y el fondo de pantalla de la app, con vista previa en vivo antes de aplicar.",
      },
      { property: "og:title", content: "Personalización | Calendar Pro" },
      {
        property: "og:description",
        content: "Color de acento, fondos predefinidos e imagen propia para tu agenda.",
      },
    ],
  }),
  component: PersonalizacionPage,
});

function PersonalizacionPage() {
  const { tema, aplicarTema, resetTema, fondos } = useMockStore();
  const [borrador, setBorrador] = useState<TemaMock>(tema);
  const fileRef = useRef<HTMLInputElement>(null);

  const fondoPreview = (css: string) => css || `url(${fondoFloral})`;

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBorrador((prev) => ({ ...prev, fondoId: "custom", fondoCss: `url(${url})` }));
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Personalización" subtitle="Color y fondo de la app" />
        <ConsultorioFilter />

        <section className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Color principal</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {COLORES_MOCK.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.label}
                onClick={() => setBorrador((prev) => ({ ...prev, primary: c.hex }))}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md border p-2 transition-colors",
                  borrador.primary === c.hex ? "border-foreground" : "border-border",
                )}
              >
                <span
                  className="flex size-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: c.hex }}
                >
                  {borrador.primary === c.hex && <Check className="size-3.5 text-white" />}
                </span>
                <span className="text-[11px]">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Label htmlFor="color-libre" className="text-xs">
              Color libre
            </Label>
            <input
              id="color-libre"
              type="color"
              value={borrador.primary}
              onChange={(e) => setBorrador((prev) => ({ ...prev, primary: e.target.value }))}
              className="h-11 w-16 cursor-pointer rounded-md border bg-transparent p-1"
            />
            <span className="text-xs text-muted-foreground uppercase">{borrador.primary}</span>
          </div>
        </section>

        <section className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Fondo de pantalla</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {fondos.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-label={f.label}
                onClick={() =>
                  setBorrador((prev) => ({ ...prev, fondoId: f.id, fondoCss: f.css }))
                }
                className={cn(
                  "min-h-11 overflow-hidden rounded-md border-2 transition-colors",
                  borrador.fondoId === f.id ? "border-foreground" : "border-border",
                )}
              >
                <span
                  className="block h-12 w-full bg-cover bg-center"
                  style={{ backgroundImage: fondoPreview(f.css) }}
                />
                <span className="block py-1 text-[11px]">{f.label}</span>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-3 min-h-11 w-full sm:w-auto"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="size-4" /> Subir imagen
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={elegirArchivo}
          />
        </section>

        <section className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Vista previa</h2>
          <div
            className="mt-3 rounded-lg border bg-cover bg-center p-3"
            style={{ backgroundImage: fondoPreview(borrador.fondoCss) }}
          >
            <div className="rounded-md bg-white/90 p-3 shadow-sm">
              <p className="text-sm font-bold" style={{ color: borrador.primary }}>
                Agosto 2026
              </p>
              <p className="mt-1 text-xs text-neutral-600">10:00 · Camila Rossi</p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-md px-3 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: borrador.primary }}
                >
                  Nuevo turno
                </span>
                <span
                  className="rounded-md border px-3 py-2 text-xs font-semibold"
                  style={{ borderColor: borrador.primary, color: borrador.primary }}
                >
                  Ver día
                </span>
              </div>
            </div>
          </div>
        </section>

        <div
          className="sticky bottom-0 flex flex-col gap-2 rounded-lg bg-card/95 p-3 shadow-sm backdrop-blur-sm sm:flex-row"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button className="min-h-11 flex-1" onClick={() => aplicarTema(borrador)}>
            Aplicar cambios
          </Button>
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            onClick={() => {
              setBorrador(TEMA_DEFAULT);
              resetTema();
            }}
          >
            <RotateCcw className="size-4" /> Restablecer valores por defecto
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
