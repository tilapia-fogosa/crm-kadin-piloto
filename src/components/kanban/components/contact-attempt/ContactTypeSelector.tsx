
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Update the type to be consistent across all forms
export type ContactType = 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined

interface ContactTypeSelectorProps {
  contactType: ContactType
  onContactTypeChange: (value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => void
  includeFaceToFace?: boolean
  disabled?: boolean
}

export function ContactTypeSelector({ 
  contactType, 
  onContactTypeChange,
  includeFaceToFace = true,
  disabled = false
}: ContactTypeSelectorProps) {
  // Log para rastreamento
  console.log('ContactTypeSelector - Renderizando com tipo:', contactType)
  console.log('ContactTypeSelector - Incluindo opção presencial:', includeFaceToFace)
  
  return (
    <div className="space-y-2">
      <Label>Tipo de Contato</Label>
      <RadioGroup
        value={contactType || ''} // Alterado para aceitar string vazia quando undefined
        onValueChange={onContactTypeChange}
        className="flex flex-col space-y-2"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="phone" id="phone" />
          <Label htmlFor="phone">Ligação Telefônica</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="whatsapp" id="whatsapp" />
          <Label htmlFor="whatsapp">Mensagem WhatsApp</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="whatsapp-call" id="whatsapp-call" />
          <Label htmlFor="whatsapp-call">Ligação WhatsApp</Label>
        </div>
        {includeFaceToFace && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="presencial" id="presencial" />
            <Label htmlFor="presencial">Presencial</Label>
          </div>
        )}
      </RadioGroup>
    </div>
  )
}
