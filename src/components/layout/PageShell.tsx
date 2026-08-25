import { useEffect, useState, type ReactNode } from "react";
import fondoFloral from "@/assets/fondo-floral.jpg";
import { useSettings } from "@/hooks/use-settings";

const STORAGE_KEY = "calendar-pro-tema";

function getBackground(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const tema = JSON.parse(raw) as { fondoCss?: string };
      if (tema.fondoCss) return tema.fondoCss;
    }
  } catch {
    /* ignore */
  }
  return "";
}

export function PageShell({ children }: { children: ReactNode }) {
  const [bg, setBg] = useState(getBackground);
  const { data: settings } = useSettings();

  useEffect(() => {
    const handler = () => setBg(getBackground());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (settings?.background_url) {
      const css = `url(${settings.background_url})`;
      setBg(css);

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const tema = raw ? JSON.parse(raw) : {};
        tema.fondoCss = css;
        tema.fondoId = "custom";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tema));
      } catch {
        /* ignore */
      }
    }
  }, [settings?.background_url]);

  const backgroundImage = bg || `url(${fondoFloral})`;

  return (
    <main
      className="min-h-screen bg-background bg-cover bg-fixed bg-center bg-no-repeat px-3 py-4 sm:px-6 sm:py-8"
      style={{ backgroundImage }}
    >
      {children}
    </main>
  );
}
