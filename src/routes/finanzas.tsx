import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { useBillingPorConsultorio } from "@/hooks/use-billing-por-consultorio";
import { usePorcentajes, useSetPorcentaje } from "@/hooks/use-config";

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
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { data: billingData, isLoading } = useBillingPorConsultorio(year, month);
  const { data: porcentajesData } = usePorcentajes();
  const setPorcentaje = useSetPorcentaje();

  const porcentajes = porcentajesData ?? { particular: 15, obra_social: 20 };

  const consultorios = billingData?.consultorios ?? [];
  const totalAPagar = billingData?.total_a_pagar ?? 0;
  const totalAFavor = billingData?.a_favor ?? 0;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        <PageHeader title="Finanzas" subtitle="Reparto por tipo de consulta" />
        <ConsultorioFilter />

        {isLoading ? (
          <div className="rounded-lg bg-card/90 p-6 text-center text-sm text-muted-foreground backdrop-blur-sm">
            Cargando datos financieros...
          </div>
        ) : (
          <>
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
                    onChange={(e) =>
                      setPorcentaje.mutate({
                        clave: "particular",
                        valor: Number(e.target.value) || 0,
                      })
                    }
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
                    value={String(porcentajes.obra_social)}
                    onChange={(e) =>
                      setPorcentaje.mutate({
                        clave: "obra_social",
                        valor: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {consultorios.map((c) => {
                const particular = c.particular_amount;
                const obraSocial = c.obra_social_amount;
                const subtotal = particular + obraSocial;
                return (
                  <div
                    key={c.consultorio}
                    className="rounded-lg bg-card/90 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <h2 className="text-base font-bold">{c.consultorio}</h2>

                    <div className="mt-3 space-y-3">
                      {[
                        {
                          label: "Particular",
                          sessions: c.particular_sessions,
                          pct: porcentajes.particular,
                          amount: c.particular_amount,
                        },
                        {
                          label: "Obra Social",
                          sessions: c.obra_social_sessions,
                          pct: porcentajes.obra_social,
                          amount: c.obra_social_amount,
                        },
                      ].map(({ label, sessions, pct, amount }) => (
                        <div key={label} className="rounded-md bg-muted/40 p-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <span className="text-sm font-semibold">{label}</span>
                            <span className="text-xs text-muted-foreground">
                              {sessions} sesiones · {pct}%
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span>
                              Al consultorio: <strong>{formatCurrency(amount)}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 border-t pt-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-sm font-semibold">Subtotal</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span>
                          Total: <strong>{formatCurrency(subtotal)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {consultorios.length === 0 && (
                <div className="rounded-lg bg-card/90 p-6 text-center text-sm text-muted-foreground backdrop-blur-sm">
                  No hay datos de facturación para este mes.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
