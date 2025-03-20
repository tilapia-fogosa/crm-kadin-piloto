
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { format, setHours, setMinutes } from "date-fns"

// Horário comercial padrão: 8h às 18h
const BUSINESS_HOURS = {
  start: 8,
  end: 18
}

export function useAvailableSlots(selectedDate: Date | undefined, unitId?: string) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    if (!unitId) {
      console.log('useAvailableSlots - Nenhum unitId fornecido, não é possível buscar slots');
      setAvailableSlots([])
      return
    }

    const fetchScheduledSlots = async () => {
      setIsLoading(true)
      console.log('useAvailableSlots - Buscando slots agendados para:', selectedDate, 'na unidade:', unitId);

      try {
        // Busca agendamentos para a data selecionada e unidade específica
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Modificado para filtrar por unidade também
        const query = supabase
          .from('clients')
          .select('scheduled_date')
          .gte('scheduled_date', startOfDay.toISOString())
          .lte('scheduled_date', endOfDay.toISOString())
        
        // Adiciona filtro de unidade se especificado
        if (unitId) {
          query.eq('unit_id', unitId);
        }

        const { data: scheduledSlots, error } = await query;

        if (error) throw error

        // Gera todos os slots possíveis do dia
        const allSlots: string[] = []
        for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
          const timeSlot = format(setMinutes(setHours(selectedDate, hour), 0), 'HH:mm')
          allSlots.push(timeSlot)
        }

        // Remove slots já agendados
        const scheduledTimes = scheduledSlots.map(slot => 
          format(new Date(slot.scheduled_date), 'HH:mm')
        )

        const availableSlots = allSlots.filter(slot => 
          !scheduledTimes.includes(slot)
        )

        console.log('useAvailableSlots - Slots disponíveis para unidade', unitId, ':', availableSlots);
        setAvailableSlots(availableSlots)
      } catch (error) {
        console.error('Erro ao buscar slots:', error)
        setAvailableSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchScheduledSlots()
  }, [selectedDate, unitId])

  return { availableSlots, isLoading }
}
