
import { type UserUnit } from "../../hooks/useUserUnit";
import { getUnitColor, shouldUseWhiteText } from "../../utils/unitColors";

interface UnitLegendProps {
  availableUnits: UserUnit[] | undefined
}

export function UnitLegend({ availableUnits }: UnitLegendProps) {
  console.log('Renderizando legenda com unidades:', availableUnits?.length);
  
  if (!availableUnits || availableUnits.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="text-xs font-medium mb-1">Legenda de unidades:</div>
      {availableUnits.map((unit, index) => {
        const unitColor = getUnitColor(index);
        const textColor = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-900';
        
        return (
          <div key={unit.unit_id} className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-sm flex items-center justify-center ${textColor}`}
              style={{ backgroundColor: unitColor }}
            />
            <span className="text-xs">{unit.units.name}</span>
          </div>
        );
      })}
    </div>
  );
}
