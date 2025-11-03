/**
 * LOG: Componente especializado para agendar aula inaugural
 * Exibe calendário e horários disponíveis considerando professor e sala
 */
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useAulaInauguralSlots } from "../hooks/useAulaInauguralSlots";
import { AulaInauguralCompleta } from "../types/pedagogical-data.types";
import { ptBR } from "date-fns/locale";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AulaInauguralSchedulerProps {
  onSelectSlot: (slot: AulaInauguralCompleta) => void;
  unitId: string;
  initialDate?: Date;
}

export function AulaInauguralScheduler({ 
  onSelectSlot, 
  unitId, 
  initialDate 
}: AulaInauguralSchedulerProps) {
  console.log('LOG: AulaInauguralScheduler renderizado para unidade:', unitId);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const { data: slots, isLoading } = useAulaInauguralSlots(selectedDate, unitId);

  const handleDateSelect = (date: Date | undefined) => {
    console.log('LOG: Data selecionada:', date);
    setSelectedDate(date);
    setSelectedSlotIndex(null); // Reset slot selection
  };

  const handleSlotSelect = (index: number) => {
    if (!selectedDate || !slots) return;

    console.log('LOG: Slot selecionado:', slots[index]);
    setSelectedSlotIndex(index);

    const slot = slots[index];
    const slotCompleto: AulaInauguralCompleta = {
      data: selectedDate,
      horario_inicio: slot.horario_inicio,
      horario_fim: slot.horario_fim,
      professor_id: slot.professor_id,
      sala_id: slot.sala_id,
    };

    onSelectSlot(slotCompleto);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LOG: Calendário para seleção de data */}
      <div className="flex flex-col">
        <h3 className="text-sm font-medium mb-3">Selecione a Data</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={ptBR}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
      </div>

      {/* LOG: Lista de horários disponíveis */}
      <div className="flex flex-col">
        <h3 className="text-sm font-medium mb-3">Horários Disponíveis</h3>
        
        {!selectedDate && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p className="text-sm">Selecione uma data para ver os horários</p>
          </div>
        )}

        {selectedDate && isLoading && (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {selectedDate && !isLoading && slots && slots.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p className="text-sm">Nenhum horário disponível nesta data</p>
          </div>
        )}

        {selectedDate && !isLoading && slots && slots.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {slots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedSlotIndex === index ? "default" : "outline"}
                className={cn(
                  "w-full justify-start text-left h-auto py-3",
                  selectedSlotIndex === index && "ring-2 ring-primary"
                )}
                onClick={() => handleSlotSelect(index)}
              >
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {slot.horario_inicio.slice(0, 5)} - {slot.horario_fim.slice(0, 5)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Duração: 1 hora
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
