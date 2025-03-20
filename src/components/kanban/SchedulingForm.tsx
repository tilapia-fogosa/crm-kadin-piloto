
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Scheduling } from "./types"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { AppointmentScheduler } from "../appointments/AppointmentScheduler"
import { UnitSelector } from "../UnitSelector"
import { useUnit } from "@/contexts/UnitContext"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
}

export function SchedulingForm({ onSubmit, cardId }: SchedulingFormProps) {
  const [notes, setNotes] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [valorizacaoDiaAnterior, setValorizacaoDiaAnterior] = useState(false)
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined>(undefined)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const { toast } = useToast()
  const { availableUnits, selectedUnitId: globalUnitId } = useUnit()
  
  // Inicializa a unidade selecionada com a unidade global se o usuário tiver acesso a apenas uma unidade
  useEffect(() => {
    console.log('SchedulingForm - Verificando unidades disponíveis:', availableUnits);
    
    if (availableUnits.length === 1) {
      console.log('SchedulingForm - Usuário tem acesso a apenas uma unidade. Definindo automaticamente:', availableUnits[0].unit_id);
      setSelectedUnitId(availableUnits[0].unit_id);
    } else if (globalUnitId) {
      console.log('SchedulingForm - Definindo unidade inicial com base na seleção global:', globalUnitId);
      setSelectedUnitId(globalUnitId);
    }
  }, [availableUnits, globalUnitId]);

  const handleSubmit = () => {
    if (!scheduledDate) {
      toast({
        title: "Erro",
        description: "Selecione a data e horário do agendamento",
        variant: "destructive",
      })
      return
    }

    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato",
        variant: "destructive",
      })
      return
    }

    if (!selectedUnitId) {
      toast({
        title: "Erro",
        description: "Selecione a unidade para o agendamento",
        variant: "destructive",
      })
      return
    }

    try {
      // Verifica se a data/hora é futura
      if (scheduledDate <= new Date()) {
        toast({
          title: "Erro",
          description: "A data e hora do agendamento devem ser futuras",
          variant: "destructive",
        })
        return
      }

      const nextContactDate = valorizacaoDiaAnterior 
        ? new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000) // D-1
        : new Date(scheduledDate.getTime()) // Mesma data

      console.log('SchedulingForm - Enviando agendamento com unitId:', selectedUnitId);
      
      onSubmit({
        scheduledDate,
        notes,
        cardId,
        valorizacaoDiaAnterior,
        nextContactDate,
        type: contactType,
        unitId: selectedUnitId
      })
    } catch (error) {
      console.error('SchedulingForm - Erro ao processar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o agendamento",
        variant: "destructive",
      })
    }
  }

  const handleSlotSelect = (date: Date) => {
    console.log('SchedulingForm - Slot selecionado:', date);
    setScheduledDate(date);
  }

  // Verifica se o usuário tem acesso a múltiplas unidades
  const hasMultipleUnits = availableUnits.length > 1;
  
  console.log('SchedulingForm - Usuário tem múltiplas unidades?', hasMultipleUnits ? 'Sim' : 'Não');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Contato</Label>
        <RadioGroup
          value={contactType}
          onValueChange={(value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => setContactType(value)}
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="presencial" id="presencial" />
            <Label htmlFor="presencial">Presencial</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Seleção de unidade (exibida apenas quando o usuário tem acesso a múltiplas unidades) */}
      {hasMultipleUnits && (
        <div className="space-y-2">
          <Label>Selecione a Unidade</Label>
          <div className="w-full max-w-xs">
            <UnitSelector 
              key={`unit-selector-${availableUnits.length}`}
              onChange={(unitId) => {
                console.log('SchedulingForm - Unidade selecionada alterada para:', unitId);
                setSelectedUnitId(unitId);
                setScheduledDate(undefined); // Reset da data ao mudar a unidade
              }}
            />
          </div>
        </div>
      )}

      {/* Só exibe o seletor de data se uma unidade estiver selecionada */}
      {selectedUnitId && (
        <div className="space-y-2">
          <Label>Selecione a Data e Horário</Label>
          <AppointmentScheduler 
            onSelectSlot={handleSlotSelect}
            simplified={true}
            unitId={selectedUnitId}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Descritivo</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digite o descritivo do agendamento"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="valorizacao"
          checked={valorizacaoDiaAnterior}
          onCheckedChange={(checked) => setValorizacaoDiaAnterior(checked as boolean)}
        />
        <Label htmlFor="valorizacao">Valorização Dia Anterior?</Label>
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        Registrar Agendamento
      </Button>
    </div>
  )
}
