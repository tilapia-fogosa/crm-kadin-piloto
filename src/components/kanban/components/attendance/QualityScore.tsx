
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { QualityScoreProps } from "../../types/attendance-form.types"

export function QualityScore({ value, onChange, disabled = false }: QualityScoreProps) {
  console.log('QualityScore - Renderizando com valor:', value, 'disabled:', disabled)
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Qualidade do Lead</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-2"
        disabled={disabled}
      >
        {['1', '2', '3', '4', '5'].map(score => (
          <div key={score} className="flex items-center space-x-1">
            <RadioGroupItem value={score} id={`score-${score}`} />
            <Label htmlFor={`score-${score}`} className="cursor-pointer">
              {score}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
