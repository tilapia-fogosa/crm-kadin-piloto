
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ObservationsProps } from "../../types/attendance-form.types"

export function Observations({ value, onChange, disabled = false }: ObservationsProps) {
  console.log('Observations - Renderizando componente com valor:', value?.substring(0, 20) + (value?.length > 20 ? '...' : ''))
  
  return (
    <div className="space-y-2">
      <Label>Observações</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Adicione observações importantes sobre o atendimento"
        className="min-h-[100px]"
        disabled={disabled}
      />
    </div>
  )
}
