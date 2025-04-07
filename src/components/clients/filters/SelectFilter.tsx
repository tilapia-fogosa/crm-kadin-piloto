
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SelectFilterProps {
  label: string
  value: string | null
  onChange: (value: string) => void
  options: string[]
  placeholder: string
}

/**
 * Componente genérico para filtros de seleção
 * 
 * @param label - Rótulo do filtro
 * @param value - Valor atual
 * @param onChange - Função chamada quando o valor muda
 * @param options - Opções disponíveis para seleção
 * @param placeholder - Texto placeholder quando nenhum valor está selecionado
 */
export function SelectFilter({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder 
}: SelectFilterProps) {
  console.log(`SelectFilter (${label}): Renderizando com valor`, value)
  
  const handleChange = (selectedValue: string) => {
    console.log(`Filtro ${label}: novo valor selecionado:`, selectedValue)
    onChange(selectedValue === "all" ? null : selectedValue)
  }

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select
        value={value || "all"}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
