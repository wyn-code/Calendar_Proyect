"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/lib/auth";

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  blockDismiss?: boolean;
}

export function LoginModal({ open, onClose, blockDismiss = false }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const session = await login(email.trim(), password, keepSession);
      toast.success(`Hola, ${session.user.nombre}`);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar sesión.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
    >
      <DialogContent
        overlayClassName="bg-black/40 backdrop-blur-md"
        className="sm:max-w-md"
        hideCloseButton={blockDismiss}
        onInteractOutside={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (blockDismiss) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Iniciar sesión</DialogTitle>
          <DialogDescription>Ingresá tu email y contraseña para continuar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="mantener-sesion"
                checked={keepSession}
                onCheckedChange={(c) => setKeepSession(c === true)}
              />
              <Label htmlFor="mantener-sesion" className="cursor-pointer text-sm font-normal">
                Mantener sesión iniciada
              </Label>
            </div>
            <span className="cursor-pointer text-sm font-medium text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Iniciando…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
