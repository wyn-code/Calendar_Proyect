import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsultorioFilter } from "@/components/layout/ConsultorioFilter";
import { FacturaUploadFlow } from "@/components/facturas/FacturaUploadFlow";

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
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl pb-10">
        <PageHeader title="Facturas" subtitle="Cargá una factura nueva" />
        <ConsultorioFilter className="mb-4" />
        <FacturaUploadFlow />
      </div>
    </PageShell>
  );
}
