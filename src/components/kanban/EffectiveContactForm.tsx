import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { EffectiveContact } from "./types"
import { useToast } from "@/components/ui/use-toast"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
}

export function EffectiveContactForm({ onSubmit, cardId }: EffectiveContactFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | undefined>(undefined)
  const [contactDate, setContactDate] = useState<Date>(() => new Date())
  const [selectedHour, setSelectedHour] = useState<string>(() => {
    const now = new Date()
    return now.getHours().toString().padStart(2, '0')
  })
  const [selectedMinute, setSelectedMinute] = useState<string>(() => {
    const now = new Date()
    return now.getMinutes().toString().padStart(2, '0')
  })
  const [notes, setNotes] = useState("")
  const [observations, setObservations] = useState("")
  const { toast } = useToast()

  const handleDateTimeChange = (date: Date | undefined, hour: string, minute: string) => {
    if (date) {
      const newDate = setHours(setMinutes(date, parseInt(minute)), parseInt(hour))
      setContactDate(newDate)
    }
  }

  const handleSubmit = () => {
    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato",
        variant: "destructive",
      })
      return
    }

    onSubmit({
      type: contactType,
      contactDate,
      notes,
      observations,
      cardId
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Contato</Label>
        <RadioGroup
          value={contactType}
          onValueChange={(value: 'phone' | 'whatsapp' | 'whatsapp-call') => setContactType(value)}
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
      <div className="space-y-2">
        <Label>Data do Contato Efetivo</Label>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !contactDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {contactDate ? (
                  format(contactDate, "dd/MM/yyyy")
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={contactDate}
                onSelect={(date) => handleDateTimeChange(date, selectedHour, selectedMinute)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex gap-2">
            <Select
              value={selectedHour}
              onValueChange={(value) => {
                setSelectedHour(value)
                handleDateTimeChange(contactDate, value, selectedMinute)
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Hora" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => 
                  <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}:00
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select
              value={selectedMinute}
              onValueChange={(value) => {
                setSelectedMinute(value)
                handleDateTimeChange(contactDate, selectedHour, value)
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Minuto" />
              </SelectTrigger>
              <SelectContent>
                {['00', '15', '30', '45'].map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descritivo</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digite o descritivo do contato"
        />
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Digite as observações adicionais"
        />
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full"
      >
        Registrar Contato Efetivo
      </Button>
    </div>
  )
}