
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTHS, YEARS } from "../../kanban/constants/dashboard.constants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";
import { Skeleton } from "@/components/ui/skeleton";

interface CommercialFiltersProps {
  selectedSource: string;
  setSelectedSource: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  selectedUnitId: string | null;
  setSelectedUnitId: (value: string | null) => void;
}

export function CommercialFilters({
  selectedSource,
  setSelectedSource,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedUnitId,
  setSelectedUnitId,
}: CommercialFiltersProps) {
  const { availableUnits, isLoading: isLoadingUnits } = useUnit();
  
  console.log('Renderizando filtros comerciais:', {
    isLoadingUnits,
    availableUnits,
    selectedUnitId
  });

  const { data: leadSources, isLoading: isLoadingLeadSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      console.log('Buscando origens de leads para filtros comerciais');
      const { data, error } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  if (isLoadingUnits || isLoadingLeadSources) {
    return (
      <div className="flex flex-wrap gap-4 justify-start">
        <div className="flex items-center gap-2">
          <span className="font-medium">Unidade:</span>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Origem:</span>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Mês:</span>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Ano:</span>
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-start">
      <div className="flex items-center gap-2">
        <span className="font-medium">Unidade:</span>
        <Select 
          value={selectedUnitId || "todos"} 
          onValueChange={(value) => setSelectedUnitId(value === "todos" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {availableUnits?.map(unitUser => (
              <SelectItem key={unitUser.unit_id} value={unitUser.unit_id}>
                {unitUser.units.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Origem:</span>
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {leadSources?.map(source => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Mês:</span>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(month => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Ano:</span>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
