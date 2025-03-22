
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface NotesFieldProps {
  notes: string
  onNotesChange: (value: string) => void
}

export function NotesField({ notes, onNotesChange }: NotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Descritivo</Label>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Digite o descritivo do contato"
      />
    </div>
  )
}
