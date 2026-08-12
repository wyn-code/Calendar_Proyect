import type { ReactNode } from "react";
import fondoFloral from "@/assets/fondo-floral.jpg";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen bg-background bg-cover bg-fixed bg-center bg-no-repeat px-3 py-4 sm:px-6 sm:py-8"
      style={{ backgroundImage: `url(${fondoFloral})` }}
    >
      {children}
    </main>
  );
}
