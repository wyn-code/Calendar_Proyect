import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePatientSearch } from "@/hooks/use-patients";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelectPatient: (id: number, nombre: string) => void;
  placeholder?: string;
}

export function PatientCombobox({ value, onChange, onSelectPatient, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 300);
    return () => clearTimeout(t);
  }, [value]);

  const { data: results = [], isLoading } = usePatientSearch(debounced, open);

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
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {open && debounced.length >= 2 && (
        <div
          className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {isLoading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Buscando…</div>
          ) : results.length > 0 ? (
            results.map((p) => (
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
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Sin resultados. Se creará un paciente nuevo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
