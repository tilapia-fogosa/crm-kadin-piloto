
import { Input } from "@/components/ui/input"

interface StudentInfoProps {
  value: string
  onChange: (value: string) => void
}

export function StudentInfo({ value, onChange }: StudentInfoProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Nome Completo do Aluno</h4>
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Digite o nome completo do aluno"
        required
      />
    </div>
  )
}

