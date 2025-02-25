
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Unit {
  id: string;
  name: string;
  city: string;
}

interface MultipleUnitSelectProps {
  selectedUnits: string[];
  onUnitsChange: (units: string[]) => void;
  disabled?: boolean;
}

export function MultipleUnitSelect({ 
  selectedUnits, 
  onUnitsChange,
  disabled = false 
}: MultipleUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data: unitsData, error } = await supabase
          .from('units')
          .select('id, name, city')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setUnits(unitsData || []);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as unidades",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [toast]);

  const toggleUnit = (unitId: string) => {
    if (selectedUnits.includes(unitId)) {
      onUnitsChange(selectedUnits.filter(id => id !== unitId));
    } else {
      onUnitsChange([...selectedUnits, unitId]);
    }
  };

  const selectedUnitNames = units
    .filter(unit => selectedUnits.includes(unit.id))
    .map(unit => `${unit.name} - ${unit.city}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-h-[40px] h-auto flex flex-wrap gap-1"
          disabled={disabled}
        >
          {selectedUnits.length > 0 ? (
            selectedUnitNames.map((name) => (
              <Badge 
                variant="secondary" 
                key={name}
                className="mr-1 mb-1"
              >
                {name}
              </Badge>
            ))
          ) : (
            "Selecione as unidades..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar unidade..." className="h-9" />
          <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Carregando unidades...
            </div>
          ) : (
            <CommandGroup>
              {units.map((unit) => (
                <CommandItem
                  key={unit.id}
                  value={`${unit.name}-${unit.city}`}
                  onSelect={() => toggleUnit(unit.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUnits.includes(unit.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {unit.name} - {unit.city}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
