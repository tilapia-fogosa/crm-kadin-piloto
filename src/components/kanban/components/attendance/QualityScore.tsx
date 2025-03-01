
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QualityScoreProps } from "../../types/attendance-form.types"

export function QualityScore({ value, onChange }: QualityScoreProps) {
  return (
    <div className="space-y-2">
      <Label>Qualidade do Lead (1-10)</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma nota" />
        </SelectTrigger>
        <SelectContent>
          {[...Array(10)].map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
