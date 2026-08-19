import type { ReactNode } from "react";
import fondoFloral from "@/assets/fondo-floral.jpg";
import { useMockStore } from "@/lib/mock-store";

export function PageShell({ children }: { children: ReactNode }) {
  const { tema } = useMockStore();
  const backgroundImage = tema.fondoCss || `url(${fondoFloral})`;

  return (
    <main
      className="min-h-screen bg-background bg-cover bg-fixed bg-center bg-no-repeat px-3 py-4 sm:px-6 sm:py-8"
      style={{ backgroundImage }}
    >
      {children}
    </main>
  );
}
