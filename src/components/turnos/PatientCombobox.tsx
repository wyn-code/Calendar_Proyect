import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizeNombre } from "@/lib/normalize";
import type { Patient } from "@/lib/api";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectPatient: (id: number, nombre: string) => void;
  pacientes: Patient[];
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function PatientCombobox({
  id,
  value,
  onChange,
  onSelectPatient,
  pacientes,
  loading = false,
  disabled = false,
  error = false,
  placeholder,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  const normalizedQuery = useMemo(() => normalizeNombre(value), [value]);

  const resultados = useMemo(() => {
    if (!query) return pacientes;
    return pacientes.filter((p) => {
      if (p.nombre_completo.toLowerCase().includes(query)) return true;
      return (
        normalizedQuery.length > 0 && normalizeNombre(p.nombre_completo).includes(normalizedQuery)
      );
    });
  }, [pacientes, query, normalizedQuery]);

  const pacienteSimilar = useMemo(() => {
    if (resultados.length > 0 || normalizedQuery.length === 0) return undefined;
    return pacientes.find((p) => normalizeNombre(p.nombre_completo) === normalizedQuery);
  }, [resultados, pacientes, normalizedQuery]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        className={cn(error && "border-destructive focus-visible:ring-destructive")}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {open && !disabled && (
        <div
          className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {loading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Cargando pacientes…</div>
          ) : resultados.length > 0 ? (
            resultados.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectPatient(p.id, p.nombre_completo);
                  setOpen(false);
                }}
                className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {p.nombre_completo}
              </button>
            ))
          ) : pacienteSimilar ? (
            <div className="space-y-1 p-1">
              <p className="px-2 py-1 text-sm text-muted-foreground">
                Ya existe un paciente similar:{" "}
                <span className="font-medium text-foreground">
                  {pacienteSimilar.nombre_completo}
                </span>
              </p>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectPatient(pacienteSimilar.id, pacienteSimilar.nombre_completo);
                  setOpen(false);
                }}
                className="block w-full rounded-sm bg-accent px-2 py-1.5 text-left text-sm text-accent-foreground hover:bg-accent/80"
              >
                Usar el paciente existente
              </button>
            </div>
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {pacientes.length === 0
                ? "Sin pacientes en este consultorio. Se creará un paciente nuevo."
                : "Sin resultados. Se creará un paciente nuevo."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
