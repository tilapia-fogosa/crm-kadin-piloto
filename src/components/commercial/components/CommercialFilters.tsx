
import { Skeleton } from "@/components/ui/skeleton";
import { useUnit } from "@/contexts/UnitContext";
import { MultiUnitSelector } from "@/components/dashboard/MultiUnitSelector";
import { MultiSourceSelector } from "./MultiSourceSelector";
import { MultiMonthSelector } from "./MultiMonthSelector";
import { MultiYearSelector } from "./MultiYearSelector";

interface CommercialFiltersProps {
  selectedSources: string[];
  setSelectedSources: (values: string[]) => void;
  selectedMonths: string[];
  setSelectedMonths: (values: string[]) => void;
  selectedYears: string[];
  setSelectedYears: (values: string[]) => void;
  selectedUnitIds: string[];
  setSelectedUnitIds: (values: string[]) => void;
}

export function CommercialFilters({
  selectedSources,
  setSelectedSources,
  selectedMonths,
  setSelectedMonths,
  selectedYears,
  setSelectedYears,
  selectedUnitIds,
  setSelectedUnitIds,
}: CommercialFiltersProps) {
  const { availableUnits, isLoading: isLoadingUnits } = useUnit();
  
  console.log('Renderizando filtros comerciais:', {
    isLoadingUnits,
    availableUnits,
    selectedUnitIds,
    selectedSources,
    selectedMonths,
    selectedYears
  });

  if (isLoadingUnits) {
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
        <MultiUnitSelector 
          units={availableUnits}
          selectedUnitIds={selectedUnitIds}
          onChange={setSelectedUnitIds}
          isLoading={isLoadingUnits}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Origem:</span>
        <MultiSourceSelector
          selectedSourceIds={selectedSources}
          onSourceChange={setSelectedSources}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Mês:</span>
        <MultiMonthSelector
          selectedMonths={selectedMonths}
          onMonthChange={setSelectedMonths}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Ano:</span>
        <MultiYearSelector
          selectedYears={selectedYears}
          onYearChange={setSelectedYears}
        />
      </div>
    </div>
  );
}
