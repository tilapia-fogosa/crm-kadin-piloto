
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ValorizationCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ValorizationCheckbox({ checked, onCheckedChange }: ValorizationCheckboxProps) {
  // Log para rastreamento
  console.log('ValorizationCheckbox - Renderizando com estado:', checked)
  
  const handleChange = (value: boolean) => {
    console.log('ValorizationCheckbox - Mudando para:', value)
    onCheckedChange(value)
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="valorizacao"
        checked={checked}
        onCheckedChange={(value) => handleChange(value as boolean)}
      />
      <Label htmlFor="valorizacao">Valorização Dia Anterior?</Label>
    </div>
  )
}
