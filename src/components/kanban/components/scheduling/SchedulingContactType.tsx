
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ContactType } from "../../hooks/useSchedulingForm"

interface SchedulingContactTypeProps {
  contactType: ContactType
  onContactTypeChange: (value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => void
  disabled?: boolean
}

export function SchedulingContactType({ 
  contactType, 
  onContactTypeChange,
  disabled = false
}: SchedulingContactTypeProps) {
  // Log para rastreamento
  console.log('SchedulingContactType - Renderizando com tipo:', contactType, 'disabled:', disabled)
  
  return (
    <div className="space-y-2">
      <Label>Tipo de Contato</Label>
      <RadioGroup
        value={contactType || ''}
        onValueChange={(value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => onContactTypeChange(value)}
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
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="presencial" id="presencial" />
          <Label htmlFor="presencial">Presencial</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
