import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { OBRAS_SOCIALES } from "@/lib/turnos";

interface Props {
  triggerId?: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  error?: boolean;
}

export function ObraSocialCombobox({
  triggerId,
  value,
  onChange,
  options = OBRAS_SOCIALES,
  error = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full justify-between font-normal",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          {value || <span className="text-muted-foreground">Seleccioná una obra social</span>}
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar obra social..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((os) => (
                <CommandItem
                  key={os}
                  value={os}
                  onSelect={(v) => {
                    onChange(v === value ? "" : os);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", value === os ? "opacity-100" : "opacity-0")} />
                  {os}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
