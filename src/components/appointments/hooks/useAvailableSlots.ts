
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { format, setHours, setMinutes, getDay } from "date-fns"

// Configuração de horários comerciais dinâmicos
const BUSINESS_HOURS = {
  // Segunda a Sexta (0 = domingo, 1 = segunda, ..., 6 = sábado)
  weekday: {
    start: 8, // 8:00
    end: 21,  // 21:00
    interval: 30 // 30 minutos
  },
  // Sábado
  saturday: {
    start: 8, // 8:00
    end: 13, // 13:00
    interval: 30 // 30 minutos
  }
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

        // Determina o dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
        const dayOfWeek = getDay(selectedDate)
        
        // Define os horários com base no dia da semana
        const hoursConfig = dayOfWeek === 6 
          ? BUSINESS_HOURS.saturday 
          : BUSINESS_HOURS.weekday

        // Verifica se é domingo (0) - não há atendimento
        if (dayOfWeek === 0) {
          console.log('useAvailableSlots - Domingo não há atendimento disponível');
          setAvailableSlots([])
          setIsLoading(false)
          return
        }

        // Gera todos os slots possíveis com intervalo de 30 minutos
        const allSlots: string[] = []
        
        // Início em horas (8) e minutos (0 ou 30)
        let currentHour = hoursConfig.start
        let currentMinute = 0
        
        // Enquanto não chegarmos ao fim do horário comercial
        while (currentHour < hoursConfig.end) {
          const timeSlot = format(
            setMinutes(setHours(selectedDate, currentHour), currentMinute), 
            'HH:mm'
          )
          allSlots.push(timeSlot)
          
          // Avança 30 minutos
          currentMinute += hoursConfig.interval
          
          // Se passar de 60 minutos, avança uma hora
          if (currentMinute >= 60) {
            currentHour += 1
            currentMinute = 0
          }
        }

        // Remove slots já agendados (bloqueando 1 hora completa)
        const scheduledTimes = scheduledSlots.map(slot => 
          format(new Date(slot.scheduled_date), 'HH:mm')
        )

        // Filtra slots disponíveis
        // Verifica se o slot atual ou o próximo slot (para formar 1 hora) já está agendado
        const availableSlots = allSlots.filter(slot => {
          const [hour, minute] = slot.split(':').map(Number)
          
          // Verificamos o slot atual
          const isCurrentSlotScheduled = scheduledTimes.includes(slot)
          
          // E também verificamos se este slot faria parte de um agendamento existente
          // (se o horário agendado é até 1 hora antes do slot atual)
          const isPartOfScheduled = scheduledTimes.some(scheduledTime => {
            const [schedHour, schedMinute] = scheduledTime.split(':').map(Number)
            
            // Verificamos se o slot atual está dentro da janela de 1 hora após um agendamento
            const slotTimeInMinutes = (hour * 60) + minute
            const schedTimeInMinutes = (schedHour * 60) + schedMinute
            
            // Se o slot atual está até 30 min depois do agendamento, ele faz parte da janela de 1h
            return slotTimeInMinutes >= schedTimeInMinutes && 
                  slotTimeInMinutes < (schedTimeInMinutes + 60)
          })
          
          return !isCurrentSlotScheduled && !isPartOfScheduled
        })

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
