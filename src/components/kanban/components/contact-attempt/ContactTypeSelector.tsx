
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ContactType } from "../../hooks/useContactAttemptForm"

interface ContactTypeSelectorProps {
  contactType: ContactType
  onContactTypeChange: (value: 'phone' | 'whatsapp' | 'whatsapp-call') => void
}

export function ContactTypeSelector({ contactType, onContactTypeChange }: ContactTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Tipo de Contato</Label>
      <RadioGroup
        value={contactType}
        onValueChange={onContactTypeChange}
        className="flex flex-col space-y-2"
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
      </RadioGroup>
    </div>
  )
}
