
import { type UserUnit } from "../../hooks/useUserUnit";
import { getUnitColor, shouldUseWhiteText } from "../../utils/unitColors";

interface UnitLegendProps {
  availableUnits: UserUnit[] | undefined;
  selectedUnitIds?: string[];
}

export function UnitLegend({ availableUnits, selectedUnitIds = [] }: UnitLegendProps) {
  console.log('Renderizando legenda com unidades:', availableUnits?.length);
  
  // Verificação de segurança para valores indefinidos
  if (!availableUnits || availableUnits.length === 0) {
    return null;
  }
  
  // Filtra unidades selecionadas se houver alguma seleção específica
  const unitsToDisplay = selectedUnitIds.length > 0 && selectedUnitIds[0] !== 'todas'
    ? availableUnits.filter(unit => selectedUnitIds.includes(unit.unit_id))
    : availableUnits;
  
  // Se não houver unidades para exibir após o filtro, não mostrar legenda
  if (unitsToDisplay.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="text-xs font-medium mb-1">Legenda de unidades:</div>
      {unitsToDisplay.map((unit, index) => {
        // Encontra o índice original da unidade na lista completa
        const unitIndex = availableUnits.findIndex(u => u.unit_id === unit.unit_id);
        const unitColor = getUnitColor(unitIndex >= 0 ? unitIndex : index);
        const textColor = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-900';
        
        return (
          <div key={unit.unit_id} className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-sm flex items-center justify-center ${textColor}`}
              style={{ backgroundColor: unitColor }}
            />
            <span className="text-xs">{unit.unit_name}</span>
          </div>
        );
      })}
    </div>
  );
}
