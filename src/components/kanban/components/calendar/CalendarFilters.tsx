
import { UserUnit } from "../../hooks/useUserUnit";
import { UnitLegend } from "./UnitLegend";

interface CalendarFiltersProps {
  userUnits?: UserUnit[];
  selectedUnitIds: string[];
  isLoading: boolean;
}

export function CalendarFilters({
  userUnits,
  selectedUnitIds,
  isLoading
}: CalendarFiltersProps) {
  console.log('🎨 [CalendarFilters] Renderizando com unidades:', userUnits?.length);
  console.log('🎨 [CalendarFilters] selectedUnitIds vindos do Kanban:', selectedUnitIds);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Unidades selecionadas no Kanban:</span>
        <span className="text-xs text-muted-foreground">
          {selectedUnitIds.length} unidade(s)
        </span>
      </div>
      
      <UnitLegend 
        availableUnits={userUnits} 
        selectedUnitIds={selectedUnitIds}
      />
    </div>
  );
}
