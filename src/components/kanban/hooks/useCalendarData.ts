// ============= COMPOUND HOOK - AGENDA + OCUPAÇÕES =============

import { useMemo, useCallback } from "react"
import { useAgendaLeads } from "./useAgendaLeads"
import { useScheduleOccupations } from "../../schedule/hooks/useScheduleOccupations"
import { 
  CalendarData, 
  CalendarItem, 
  CalendarAppointment, 
  CalendarOccupation 
} from "../types/calendar"
import { format, startOfMonth, endOfMonth } from "date-fns"

/**
 * Hook composto que combina dados de agendamentos e ocupações para o calendário
 * Mantém compatibilidade total com useAgendaLeads existente
 */
export function useCalendarData(selectedUnitIds: string[] = []): CalendarData {
  console.log('🎯 [useCalendarData] Hook iniciado com unidades:', selectedUnitIds)
  
  // Hook existente para agendamentos - mantido sem modificação
  const {
    appointments: rawAppointments,
    isLoading: isLoadingAppointments,
    currentDate,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth,
    refetch: refetchAppointments
  } = useAgendaLeads(selectedUnitIds)

  // Para ocupações, vamos buscar de todas as unidades do usuário
  // já que useScheduleOccupations só aceita uma unidade por vez
  const allUserUnitIds = useMemo(() => {
    return userUnits?.map(unit => unit.unit_id) || []
  }, [userUnits])

  // Por ora, vamos usar a primeira unidade selecionada ou primeira do usuário
  // TODO: Futuramente, modificar useScheduleOccupations para aceitar múltiplas unidades
  const primaryUnitId = useMemo(() => {
    if (selectedUnitIds && selectedUnitIds.length > 0) {
      return selectedUnitIds[0]
    }
    return allUserUnitIds.length > 0 ? allUserUnitIds[0] : undefined
  }, [selectedUnitIds, allUserUnitIds])

  const {
    occupations: rawOccupations,
    isLoading: isLoadingOccupations,
    refreshOccupations
  } = useScheduleOccupations(primaryUnitId)

  // Log: Estados de loading
  console.log('📊 [useCalendarData] Estados de loading:', {
    appointments: isLoadingAppointments,
    occupations: isLoadingOccupations,
    units: isLoadingUnits
  })

  // Filtrar ocupações pelo período atual (mês) e unidades selecionadas
  const filteredOccupations = useMemo(() => {
    if (!rawOccupations || rawOccupations.length === 0) {
      console.log('📭 [useCalendarData] Nenhuma ocupação bruta disponível')
      return []
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    console.log('📅 [useCalendarData] Filtrando ocupações para período:', {
      início: format(monthStart, 'yyyy-MM-dd'),
      fim: format(monthEnd, 'yyyy-MM-dd'),
      unidadesSelecionadas: selectedUnitIds
    })

    const filtered = rawOccupations.filter(occupation => {
      const occupationDate = new Date(occupation.start_datetime)
      const isInMonth = occupationDate >= monthStart && occupationDate <= monthEnd
      
      // Filtrar por unidades selecionadas (se especificadas) ou permitir todas as unidades do usuário
      let isInSelectedUnits = true
      
      if (selectedUnitIds && selectedUnitIds.length > 0) {
        // Se há unidades específicas selecionadas, filtrar por elas
        isInSelectedUnits = selectedUnitIds.includes(occupation.unit_id)
      } else {
        // Se não há unidades específicas, aceitar qualquer unidade do usuário
        isInSelectedUnits = allUserUnitIds.includes(occupation.unit_id)
      }
      
      const shouldInclude = isInMonth && isInSelectedUnits
      
      if (shouldInclude) {
        console.log('✅ [useCalendarData] Ocupação incluída:', {
          id: occupation.id,
          title: occupation.title,
          date: format(occupationDate, 'yyyy-MM-dd HH:mm'),
          unit_id: occupation.unit_id,
          filtro: selectedUnitIds.length > 0 ? 'unidades_selecionadas' : 'todas_do_usuario'
        })
      }
      
      return shouldInclude
    })

    console.log(`🎯 [useCalendarData] Ocupações filtradas: ${filtered.length} de ${rawOccupations.length}`)
    return filtered
  }, [rawOccupations, currentDate, selectedUnitIds, allUserUnitIds])

  // Transformar agendamentos para CalendarAppointment
  const appointments: CalendarAppointment[] = useMemo(() => {
    const transformed = rawAppointments.map(appointment => ({
      ...appointment,
      type: 'appointment' as const
    }))
    
    console.log(`🎯 [useCalendarData] Agendamentos transformados: ${transformed.length}`)
    return transformed
  }, [rawAppointments])

  // Transformar ocupações para CalendarOccupation
  const occupations: CalendarOccupation[] = useMemo(() => {
    const transformed = filteredOccupations.map(occupation => {
      // Buscar nome da unidade usando userUnits
      const unit = userUnits?.find(u => u.unit_id === occupation.unit_id)
      
      return {
        id: occupation.id,
        name: occupation.title, // título da ocupação vira o "nome"
        scheduled_date: occupation.start_datetime,
        unit_id: occupation.unit_id,
        unit_name: unit?.unit_name || 'Unidade não encontrada',
        type: 'occupation' as const,
        duration_minutes: occupation.duration_minutes,
        description: occupation.description,
        created_by_name: occupation.created_by_name
      }
    })
    
    console.log(`🎯 [useCalendarData] Ocupações transformadas: ${transformed.length}`)
    return transformed
  }, [filteredOccupations, userUnits])

  // Combinar todos os itens e ordenar por data
  const combinedItems: CalendarItem[] = useMemo(() => {
    const combined = [...appointments, ...occupations].sort((a, b) => 
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    )
    
    console.log(`🎯 [useCalendarData] Itens combinados: ${combined.length} (${appointments.length} agendamentos + ${occupations.length} ocupações)`)
    
    // Log de distribuição por tipo para debug
    const appointmentCount = combined.filter(item => item.type === 'appointment').length
    const occupationCount = combined.filter(item => item.type === 'occupation').length
    console.log('📊 [useCalendarData] Distribuição final:', { appointments: appointmentCount, occupations: occupationCount })
    
    return combined
  }, [appointments, occupations])

  // Função de refetch combinada
  const refetch = useCallback(async () => {
    console.log('🔄 [useCalendarData] Executando refetch combinado')
    
    try {
      // Executar refetch dos agendamentos
      await refetchAppointments()
      
      // Refetch das ocupações se temos uma unidade
      if (primaryUnitId) {
        await refreshOccupations()
      }
      
      console.log('✅ [useCalendarData] Refetch combinado concluído')
    } catch (error) {
      console.error('❌ [useCalendarData] Erro no refetch combinado:', error)
    }
  }, [refetchAppointments, refreshOccupations, primaryUnitId])

  const isLoading = isLoadingAppointments || isLoadingOccupations

  return {
    items: combinedItems,
    appointments,
    occupations,
    isLoading,
    currentDate,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth,
    refetch
  }
}