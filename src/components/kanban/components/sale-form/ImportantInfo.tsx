
import { Textarea } from "@/components/ui/textarea"

interface ImportantInfoProps {
  value: string
  onChange: (value: string) => void
}

export function ImportantInfo({ value, onChange }: ImportantInfoProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Informações Importantes do Cliente</h4>
      <Textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="min-h-[100px]"
        placeholder="Coloque aqui o máximo de informações pertinentes sobre o seu atendimento: idade, reclamação principal, hobbies, informações de família, histórias e detalhes que sejam pertinentes para a equipe pedagógica"
      />
    </div>
  )
}
