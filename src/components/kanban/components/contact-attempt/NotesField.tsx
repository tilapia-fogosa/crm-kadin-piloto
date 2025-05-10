
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface NotesFieldProps {
  notes: string
  onNotesChange: (value: string) => void
  disabled?: boolean
}

export function NotesField({ 
  notes, 
  onNotesChange, 
  disabled = false 
}: NotesFieldProps) {
  console.log('NotesField - Renderizando componente')
  
  return (
    <div className="space-y-2">
      <Label>Descritivo</Label>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Digite o descritivo do contato"
        disabled={disabled}
        className="min-h-[100px]"
      />
    </div>
  )
}
