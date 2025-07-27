
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VoiceTranscriptionButton } from "@/components/ui/voice-transcription-button"

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
  
  const handleTranscription = (transcribedText: string) => {
    console.log('NotesField - Texto transcrito recebido:', transcribedText?.substring(0, 50) + '...')
    
    // Se já há texto, adiciona uma quebra de linha antes do novo texto
    const newText = notes.trim() 
      ? `${notes.trim()}\n\n${transcribedText}` 
      : transcribedText
    
    onNotesChange(newText)
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Descritivo</Label>
        <VoiceTranscriptionButton 
          onTranscript={handleTranscription}
          disabled={disabled}
          variant="outline"
          size="sm"
        />
      </div>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Digite o descritivo do contato ou use o botão de áudio para transcrever"
        disabled={disabled}
        className="min-h-[100px]"
      />
    </div>
  )
}
