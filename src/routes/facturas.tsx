import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FacturaUploadFlow } from "@/components/facturas/FacturaUploadFlow";
import { useMockStore } from "@/lib/mock-store";

export const Route = createFileRoute("/facturas")({
  head: () => ({
    meta: [
      { title: "Facturas | Calendar Pro" },
      {
        name: "description",
        content:
          "Subí facturas en PDF o foto, revisá los datos detectados y confirmá la carga en segundos.",
      },
      { property: "og:title", content: "Facturas | Calendar Pro" },
      {
        property: "og:description",
        content: "Carga de facturas con lectura automática y revisión manual.",
      },
    ],
  }),
  component: FacturasPage,
});

function FacturasPage() {
  const { registrarFactura } = useMockStore();

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl pb-10">
        <PageHeader title="Facturas" subtitle="Cargá una factura nueva" />
        <FacturaUploadFlow onGuardado={registrarFactura} />
      </div>
    </PageShell>
  );
}
