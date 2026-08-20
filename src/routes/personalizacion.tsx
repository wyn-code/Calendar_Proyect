import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ImagePlus, RotateCcw } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import fondoFloral from "@/assets/fondo-floral.jpg";
import { COLORES_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personalizacion")({
  head: () => ({
    meta: [
      { title: "Personalizacion | Calendar Pro" },
      {
        name: "description",
        content: "Elegi el color principal y el fondo de pantalla de la app.",
      },
      { property: "og:title", content: "Personalizacion | Calendar Pro" },
      {
        property: "og:description",
        content: "Color de acento, fondos predefinidos e imagen propia.",
      },
    ],
  }),
  component: PersonalizacionPage,
});

interface TemaState {
  primary: string;
  fondoId: string;
  fondoCss: string;
}

const FONDOS = [
  { id: "floral", label: "Floral", css: "" },
  {
    id: "rosa-suave",
    label: "Rosa suave",
    css: "linear-gradient(160deg, #fdf1f5 0%, #f7e2ec 60%, #efd6e6 100%)",
  },
  {
    id: "lila",
    label: "Lila",
    css: "linear-gradient(160deg, #f4f0fb 0%, #e8e0f8 60%, #ded4f3 100%)",
  },
  { id: "crema", label: "Crema", css: "linear-gradient(160deg, #fdfaf4 0%, #f6eee2 100%)" },
];

const TEMA_DEFAULT: TemaState = { primary: "#d96a92", fondoId: "floral", fondoCss: "" };
const STORAGE_KEY = "calendar-pro-tema";

function loadTema(): TemaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TemaState;
  } catch {
    /* ignore */
  }
  return TEMA_DEFAULT;
}

function saveTema(tema: TemaState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tema));
}

function contraste(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1c1418" : "#ffffff";
}

function PersonalizacionPage() {
  const [tema, setTema] = useState<TemaState>(loadTema);
  const [borrador, setBorrador] = useState<TemaState>(tema);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", tema.primary);
    root.style.setProperty("--primary-foreground", contraste(tema.primary));
    root.style.setProperty("--ring", tema.primary);
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
    };
  }, [tema.primary]);

  const fondoPreview = (css: string) => css || `url(${fondoFloral})`;

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBorrador((prev) => ({ ...prev, fondoId: "custom", fondoCss: `url(${url})` }));
  };

  const aplicar = () => {
    setTema(borrador);
    saveTema(borrador);
  };

  const reset = () => {
    setBorrador(TEMA_DEFAULT);
    setTema(TEMA_DEFAULT);
    saveTema(TEMA_DEFAULT);
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Personalizacion" subtitle="Color y fondo de la app" />
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
            {FONDOS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-label={f.label}
                onClick={() => setBorrador((prev) => ({ ...prev, fondoId: f.id, fondoCss: f.css }))}
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
              <p className="mt-1 text-xs text-neutral-600">10:00 - Camila Rossi</p>
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
                  Ver dia
                </span>
              </div>
            </div>
          </div>
        </section>

        <div
          className="sticky bottom-0 flex flex-col gap-2 rounded-lg bg-card/95 p-3 shadow-sm backdrop-blur-sm sm:flex-row"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button className="min-h-11 flex-1" onClick={aplicar}>
            Aplicar cambios
          </Button>
          <Button variant="outline" className="min-h-11 flex-1" onClick={reset}>
            <RotateCcw className="size-4" /> Restablecer valores por defecto
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
