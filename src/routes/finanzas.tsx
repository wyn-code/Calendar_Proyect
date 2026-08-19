import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { useMockStore } from "@/lib/mock-store";

export const Route = createFileRoute("/finanzas")({
  head: () => ({
    meta: [
      { title: "Finanzas | Calendar Pro" },
      {
        name: "description",
        content:
          "Definí el porcentaje por tipo de consulta y mirá al instante cuánto queda a favor y cuánto se paga a cada consultorio.",
      },
      { property: "og:title", content: "Finanzas | Calendar Pro" },
      {
        property: "og:description",
        content: "Reparto por tipo de consulta con cálculo en vivo de totales a favor y a pagar.",
      },
    ],
  }),
  component: FinanzasPage,
});

function FinanzasPage() {
  const { consultorios, porcentajes, setPorcentajeTipo, filtroConsultorio } = useMockStore();

  const visibles =
    filtroConsultorio === "Todos"
      ? consultorios
      : consultorios.filter((c) => c.nombre === filtroConsultorio);

  const calcular = (facturado: number, pct: number) => {
    const alConsultorio = (facturado * pct) / 100;
    return { facturado, pct, alConsultorio, aFavor: facturado - alConsultorio };
  };

  const subtotales = visibles.map((c) => {
    const particular = calcular(c.facturadoParticular, porcentajes.particular);
    const obraSocial = calcular(c.facturadoObraSocial, porcentajes.obraSocial);
    return {
      consultorio: c,
      particular,
      obraSocial,
      facturado: particular.facturado + obraSocial.facturado,
      alConsultorio: particular.alConsultorio + obraSocial.alConsultorio,
      aFavor: particular.aFavor + obraSocial.aFavor,
    };
  });

  const totalAPagar = subtotales.reduce((acc, s) => acc + s.alConsultorio, 0);
  const totalAFavor = subtotales.reduce((acc, s) => acc + s.aFavor, 0);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Finanzas" subtitle="Reparto por tipo de consulta" />
        <ConsultorioFilter />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">Total a favor</p>
            <p className="mt-1 text-lg font-bold text-primary sm:text-2xl">
              {formatCurrency(totalAFavor)}
            </p>
          </div>
          <div className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">{formatCurrency(totalAPagar)}</p>
          </div>
        </div>

        {/* Porcentajes globales por tipo de consulta */}
        <div className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <h2 className="text-base font-bold">Porcentaje al consultorio</h2>
          <p className="text-xs text-muted-foreground">
            Se aplica a todos los consultorios por igual.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pct-particular" className="text-xs">
                Particular (%)
              </Label>
              <Input
                id="pct-particular"
                className="mt-1 min-h-11"
                inputMode="numeric"
                value={String(porcentajes.particular)}
                onChange={(e) => setPorcentajeTipo("particular", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="pct-os" className="text-xs">
                Obra Social (%)
              </Label>
              <Input
                id="pct-os"
                className="mt-1 min-h-11"
                inputMode="numeric"
                value={String(porcentajes.obraSocial)}
                onChange={(e) => setPorcentajeTipo("obraSocial", Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {subtotales.map((s) => (
            <div
              key={s.consultorio.id}
              className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm"
            >
              <h2 className="text-base font-bold">{s.consultorio.nombre}</h2>

              <div className="mt-3 space-y-3">
                {[
                  { label: "Particular", data: s.particular },
                  { label: "Obra Social", data: s.obraSocial },
                ].map(({ label, data }) => (
                  <div key={label} className="rounded-md bg-muted/40 p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        Facturado: {formatCurrency(data.facturado)} · {data.pct}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span>
                        Al consultorio: <strong>{formatCurrency(data.alConsultorio)}</strong>
                      </span>
                      <span className="text-primary">
                        A favor: <strong>{formatCurrency(data.aFavor)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold">Subtotal</span>
                  <span className="text-xs text-muted-foreground">
                    Facturado: {formatCurrency(s.facturado)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>
                    Al consultorio: <strong>{formatCurrency(s.alConsultorio)}</strong>
                  </span>
                  <span className="text-primary">
                    A favor: <strong>{formatCurrency(s.aFavor)}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
