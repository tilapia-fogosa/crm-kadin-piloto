
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
  
  // Filtrar apenas as unidades que estão selecionadas no Kanban
  const selectedUnits = userUnits?.filter(unit => 
    selectedUnitIds.includes(unit.unit_id)
  ) || [];

  console.log('🎨 [CalendarFilters] Unidades filtradas para exibição:', selectedUnits.length);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">Filtrando por unidades do Kanban:</span>
        <span className="text-xs text-muted-foreground">
          {selectedUnitIds.length} unidade(s) selecionada(s)
        </span>
      </div>
      
      {selectedUnits.length > 0 ? (
        <div className="space-y-1">
          {selectedUnits.map(unit => (
            <div key={unit.unit_id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
              📍 {unit.unit_name}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic">
          Nenhuma unidade selecionada no Kanban
        </div>
      )}
      
      <UnitLegend 
        availableUnits={userUnits} 
        selectedUnitIds={selectedUnitIds}
      />
    </div>
  );
}
