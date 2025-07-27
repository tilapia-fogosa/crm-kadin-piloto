
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VoiceTranscriptionButton } from "@/components/ui/voice-transcription-button"
import { ObservationsProps } from "../../types/attendance-form.types"

export function Observations({ value, onChange, disabled = false }: ObservationsProps) {
  console.log('Observations - Renderizando componente com valor:', value?.substring(0, 20) + (value?.length > 20 ? '...' : ''))
  
  const handleTranscription = (transcribedText: string) => {
    console.log('Observations - Texto transcrito recebido:', transcribedText?.substring(0, 50) + '...')
    
    // Se já há texto, adiciona uma quebra de linha antes do novo texto
    const newText = value.trim() 
      ? `${value.trim()}\n\n${transcribedText}` 
      : transcribedText
    
    onChange(newText)
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Observações</Label>
        <VoiceTranscriptionButton 
          onTranscript={handleTranscription}
          disabled={disabled}
          variant="outline"
          size="sm"
        />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Adicione observações importantes sobre o atendimento ou use o botão de áudio para transcrever"
        className="min-h-[100px]"
        disabled={disabled}
      />
    </div>
  )
}
