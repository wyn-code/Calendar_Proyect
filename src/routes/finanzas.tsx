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
          "Definí el porcentaje de cada consultorio y mirá al instante cuánto queda a favor y cuánto se paga.",
      },
      { property: "og:title", content: "Finanzas | Calendar Pro" },
      {
        property: "og:description",
        content: "Reparto por consultorio con cálculo en vivo de totales a favor y a pagar.",
      },
    ],
  }),
  component: FinanzasPage,
});

function FinanzasPage() {
  const { consultorios, setPorcentaje, filtroConsultorio } = useMockStore();

  const visibles =
    filtroConsultorio === "Todos"
      ? consultorios
      : consultorios.filter((c) => c.nombre === filtroConsultorio);

  const totalAPagar = visibles.reduce(
    (acc, c) => acc + (c.totalFacturado * c.porcentaje) / 100,
    0,
  );
  const totalAFavor = visibles.reduce(
    (acc, c) => acc + (c.totalFacturado * (100 - c.porcentaje)) / 100,
    0,
  );

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Finanzas" subtitle="Reparto por consultorio" />
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

        <div className="space-y-3">
          {visibles.map((c) => {
            const alConsultorio = (c.totalFacturado * c.porcentaje) / 100;
            const aFavor = c.totalFacturado - alConsultorio;
            return (
              <div key={c.id} className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold">{c.nombre}</h2>
                    <p className="text-xs text-muted-foreground">
                      Total facturado: {formatCurrency(c.totalFacturado)}
                    </p>
                  </div>
                  <div className="w-24 shrink-0">
                    <Label htmlFor={`pct-${c.id}`} className="text-xs">
                      %
                    </Label>
                    <Input
                      id={`pct-${c.id}`}
                      className="mt-1 min-h-11"
                      inputMode="numeric"
                      value={String(c.porcentaje)}
                      onChange={(e) => setPorcentaje(c.id, Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>
                    Al consultorio:{" "}
                    <strong>
                      {formatCurrency(alConsultorio)} ({c.porcentaje}%)
                    </strong>
                  </span>
                  <span className="text-primary">
                    A favor:{" "}
                    <strong>
                      {formatCurrency(aFavor)} ({100 - c.porcentaje}%)
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
