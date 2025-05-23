
import { Label } from "@/components/ui/label"
import { UnitSelector } from "@/components/UnitSelector"

interface UnitSelectionProps {
  onUnitChange: (unitId: string) => void
  availableUnitsCount: number
  selectedUnitId?: string
  disabled?: boolean
}

export function UnitSelection({ 
  onUnitChange, 
  availableUnitsCount,
  selectedUnitId,
  disabled = false
}: UnitSelectionProps) {
  // Log para rastreamento
  console.log('UnitSelection - Renderizando com quantidade de unidades:', availableUnitsCount)
  console.log('UnitSelection - Unidade selecionada atualmente:', selectedUnitId || 'nenhuma', 'disabled:', disabled)
  
  return (
    <div className="space-y-2">
      <Label>Selecione a Unidade</Label>
      <div className="w-full max-w-xs">
        <UnitSelector 
          key={`unit-selector-${availableUnitsCount}`}
          onChange={(unitId) => {
            console.log('UnitSelection - Unidade selecionada alterada para:', unitId)
            onUnitChange(unitId)
          }}
          value={selectedUnitId}
          placeholder="Escolha uma unidade"
          required={true}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
