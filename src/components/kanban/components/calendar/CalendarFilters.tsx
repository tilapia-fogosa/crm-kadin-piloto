
import { UserUnit } from "../../hooks/useUserUnit";
import { MultiUnitSelector } from "./MultiUnitSelector";
import { UnitLegend } from "./UnitLegend";

interface CalendarFiltersProps {
  userUnits?: UserUnit[];
  selectedUnitIds: string[];
  onChangeUnits: (unitIds: string[]) => void;
  isLoading: boolean;
}

export function CalendarFilters({
  userUnits,
  selectedUnitIds,
  onChangeUnits,
  isLoading
}: CalendarFiltersProps) {
  console.log('Renderizando CalendarFilters com unidades:', userUnits?.length);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Unidades:</span>
        <MultiUnitSelector
          units={userUnits}
          selectedUnitIds={selectedUnitIds}
          onChange={onChangeUnits}
          isLoading={isLoading}
        />
      </div>
      
      <UnitLegend 
        availableUnits={userUnits} 
        selectedUnitIds={selectedUnitIds}
      />
    </div>
  );
}
