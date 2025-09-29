
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
      console.log('useAvailableSlots - Data não selecionada, limpando slots');
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

        // Buscar agendamentos
        const clientsQuery = supabase
          .from('clients')
          .select('scheduled_date')
          .gte('scheduled_date', startOfDay.toISOString())
          .lte('scheduled_date', endOfDay.toISOString())
        
        if (unitId) {
          clientsQuery.eq('unit_id', unitId);
        }

        // Buscar ocupações
        const occupationsQuery = supabase
          .from('schedule_occupations')
          .select('start_datetime, duration_minutes')
          .gte('start_datetime', startOfDay.toISOString())
          .lte('start_datetime', endOfDay.toISOString())
          .eq('active', true)
        
        if (unitId) {
          occupationsQuery.eq('unit_id', unitId);
        }

        const [clientsResult, occupationsResult] = await Promise.all([
          clientsQuery,
          occupationsQuery
        ]);

        if (clientsResult.error) throw clientsResult.error;
        if (occupationsResult.error) throw occupationsResult.error;

        const scheduledSlots = clientsResult.data;
        const occupations = occupationsResult.data;

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

        // Converte horários agendados para minutos do dia para facilitar comparações
        const scheduledTimesInMinutes = scheduledSlots.map(slot => {
          const date = new Date(slot.scheduled_date);
          return date.getHours() * 60 + date.getMinutes();
        });

        // Converte ocupações para intervalos ocupados (considerando duração)
        const occupationIntervals = occupations.map(occupation => {
          const startDate = new Date(occupation.start_datetime);
          const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
          const endMinutes = startMinutes + occupation.duration_minutes;
          return { start: startMinutes, end: endMinutes };
        });

        console.log('useAvailableSlots - Horários agendados (em minutos):', scheduledTimesInMinutes);
        console.log('useAvailableSlots - Intervalos de ocupação:', occupationIntervals);

        // Nova lógica: filtrar slots considerando agendamentos e ocupações
        const availableSlots = allSlots.filter(slot => {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTimeInMinutes = hour * 60 + minute;
          
          // Verifica se o slot está bloqueado por agendamentos
          const isBlockedByScheduled = scheduledTimesInMinutes.some(scheduledTime => {
            return (
              // É o próprio horário agendado
              slotTimeInMinutes === scheduledTime ||
              // Está 30 minutos depois de um agendamento (que dura 1 hora)
              (slotTimeInMinutes > scheduledTime && slotTimeInMinutes < scheduledTime + 60) ||
              // Está 30 minutos antes de um agendamento (considerando que o agendamento começa e usa 30 min antes)
              (slotTimeInMinutes < scheduledTime && slotTimeInMinutes + 60 > scheduledTime)
            );
          });

          // Verifica se o slot está bloqueado por ocupações
          const isBlockedByOccupation = occupationIntervals.some(interval => {
            // O slot está dentro do intervalo da ocupação (com margem de 30 min antes/depois)
            return (
              // Slot está dentro da ocupação
              (slotTimeInMinutes >= interval.start && slotTimeInMinutes < interval.end) ||
              // Slot + 60 min (duração do agendamento) overlap com a ocupação
              (slotTimeInMinutes < interval.start && slotTimeInMinutes + 60 > interval.start) ||
              // Slot está 30 min antes da ocupação
              (slotTimeInMinutes >= interval.start - 30 && slotTimeInMinutes < interval.start)
            );
          });

          const isBlocked = isBlockedByScheduled || isBlockedByOccupation;
          
          // Log detalhado para depuração
          if (isBlocked) {
            const reason = isBlockedByScheduled ? 'agendamento' : 'ocupação';
            console.log(`useAvailableSlots - Slot ${slot} está bloqueado por ${reason}`);
          }
          
          // Retorna true para slots não bloqueados
          return !isBlocked;
        });

        console.log('useAvailableSlots - Slots disponíveis após aplicar regras de bloqueio:', availableSlots);
        setAvailableSlots(availableSlots);
      } catch (error) {
        console.error('Erro ao buscar slots:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchScheduledSlots();
  }, [selectedDate, unitId]);

  return { availableSlots, isLoading };
}
