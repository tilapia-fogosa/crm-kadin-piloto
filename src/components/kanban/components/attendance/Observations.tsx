
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ObservationsProps } from "../../types/attendance-form.types"

export function Observations({ value, onChange }: ObservationsProps) {
  return (
    <div className="space-y-2">
      <Label>Observações</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite suas observações..."
      />
    </div>
  )
}
