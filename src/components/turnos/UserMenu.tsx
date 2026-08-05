import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle2 } from "lucide-react";
import { clearSession, getSession } from "@/lib/auth";

export function UserMenu() {
  const session = getSession();

  const cerrarSesion = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cuenta"
          className="size-8 shrink-0 text-muted-foreground"
        >
          <UserCircle2 className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        {session?.user?.nombre && (
          <div className="px-2 pb-1 text-sm text-muted-foreground">{session.user.nombre}</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={cerrarSesion}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
