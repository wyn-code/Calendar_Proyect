import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  Settings,
  UserCircle2,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { USUARIO_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Calendario", icon: CalendarDays },
  { to: "/pacientes", label: "Pacientes", icon: Users },
  { to: "/facturas", label: "Facturas", icon: FileText },
  { to: "/finanzas", label: "Finanzas", icon: Wallet },
  { to: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menú" className="size-10 shrink-0">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="border-b px-4 py-4 pr-12">
          <SheetTitle>Calendar Pro</SheetTitle>
          <p className="text-xs text-muted-foreground">Gestión de turnos</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="border-t p-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex min-w-0 items-center gap-2 px-1 py-1.5">
            <UserCircle2 className="size-5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-muted-foreground">{USUARIO_MOCK.email}</span>
          </div>
          <button
            type="button"
            onClick={() => console.log("cerrar sesión (placeholder)")}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
