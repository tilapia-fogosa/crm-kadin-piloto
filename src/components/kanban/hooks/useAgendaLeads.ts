import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useUserUnit } from "./useUserUnit"

interface AgendaLead {
  id: string
  name: string
  scheduled_date: string
  unit_id: string
  unit_name?: string
}

export function useAgendaLeads(selectedUnitIds: string[] = []) {
  const [appointments, setAppointments] = useState<AgendaLead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const isExecutingRef = useRef(false)
  const executionCountRef = useRef(0)
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  console.log('🎯 [useAgendaLeads] Hook iniciado')
  console.log('📊 [useAgendaLeads] selectedUnitIds recebidos:', selectedUnitIds)
  console.log('🔢 [useAgendaLeads] Quantidade de unidades selecionadas:', selectedUnitIds?.length || 0)

  const fetchAgendaLeads = useCallback(async () => {
    // Prevenir execuções simultâneas
    if (isExecutingRef.current) {
      console.log('⚠️ [useAgendaLeads] Execução já em andamento, ignorando nova chamada')
      return
    }

    executionCountRef.current += 1
    const executionId = executionCountRef.current
    console.log(`🔍 [useAgendaLeads] Execução #${executionId} - Iniciando busca de agendamentos`)
    
    isExecutingRef.current = true
    setIsLoading(true)
    
    try {
      // Definir período do mês atual
      const startOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`
      const endOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`

      console.log(`📅 [useAgendaLeads] Execução #${executionId} - Período de busca:`, {
        início: startOfMonth,
        fim: endOfMonth,
        mês: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      })

      // Estratégia 1: Usar selectedUnitIds se fornecidos
      let unitIdsToFilter: string[] = []
      
      if (selectedUnitIds && selectedUnitIds.length > 0) {
        unitIdsToFilter = selectedUnitIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
        console.log(`✅ [useAgendaLeads] Execução #${executionId} - Usando selectedUnitIds do Kanban:`, unitIdsToFilter)
      }
      
      // Estratégia 2: Fallback para unidades do usuário (sem adicionar às dependências)
      if (unitIdsToFilter.length === 0 && userUnits && userUnits.length > 0) {
        unitIdsToFilter = userUnits.map(unit => unit.unit_id)
        console.log(`🔄 [useAgendaLeads] Execução #${executionId} - Fallback para unidades do usuário:`, unitIdsToFilter)
      }

      // Query otimizada sem embed problemático
      let query = supabase
        .from('clients')
        .select('id, name, scheduled_date, unit_id')
        .not('scheduled_date', 'is', null)
        .eq('active', true)
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth + ' 23:59:59')
        .order('scheduled_date', { ascending: true })

      // Aplicar filtro de unidades se disponível
      if (unitIdsToFilter.length > 0) {
        query = query.in('unit_id', unitIdsToFilter)
        console.log(`🎯 [useAgendaLeads] Execução #${executionId} - Aplicando filtro de unidades:`, unitIdsToFilter)
      } else {
        console.log(`⚠️ [useAgendaLeads] Execução #${executionId} - Nenhuma unidade para filtrar - buscando todos os agendamentos`)
      }

      const { data: clients, error } = await query

      if (error) {
        console.error(`❌ [useAgendaLeads] Execução #${executionId} - Erro na query:`, error)
        setAppointments([])
        return
      }

      console.log(`📊 [useAgendaLeads] Execução #${executionId} - Agendamentos encontrados:`, clients?.length || 0)
      
      if (clients && clients.length > 0) {
        console.log(`📋 [useAgendaLeads] Execução #${executionId} - Primeiro agendamento:`, clients[0])
        
        // Mapear dados e adicionar nome da unidade usando userUnits em memória
        const transformedAppointments: AgendaLead[] = clients.map(client => {
          const unit = userUnits?.find(u => u.unit_id === client.unit_id)
          return {
            id: client.id,
            name: client.name,
            scheduled_date: client.scheduled_date,
            unit_id: client.unit_id,
            unit_name: unit?.unit_name || 'Unidade não encontrada'
          }
        })

        console.log(`✅ [useAgendaLeads] Execução #${executionId} - Agendamentos processados:`, transformedAppointments.length)
        
        setAppointments(transformedAppointments)
      } else {
        console.log(`📭 [useAgendaLeads] Execução #${executionId} - Nenhum agendamento encontrado`)
        setAppointments([])
      }

    } catch (error) {
      console.error(`💥 [useAgendaLeads] Execução #${executionId} - Erro geral:`, error)
      setAppointments([])
    } finally {
      setIsLoading(false)
      isExecutingRef.current = false
      console.log(`🏁 [useAgendaLeads] Execução #${executionId} - Finalizada`)
    }
  }, [selectedUnitIds, currentDate, userUnits])

  const handlePreviousMonth = useCallback(() => {
    console.log('⬅️ [useAgendaLeads] Navegando para o mês anterior')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }, [currentDate])

  const handleNextMonth = useCallback(() => {
    console.log('➡️ [useAgendaLeads] Navegando para o próximo mês')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }, [currentDate])

  // useEffect principal - DEPENDÊNCIAS CORRIGIDAS
  useEffect(() => {
    console.log('🔄 [useAgendaLeads] useEffect principal disparado')
    console.log('📊 [useAgendaLeads] Estado das dependências:', { 
      selectedUnitIds, 
      quantidadeUnidades: selectedUnitIds?.length || 0,
      mesAtual: currentDate.getMonth() + 1,
      anoAtual: currentDate.getFullYear(),
      userUnitsCarregadas: !isLoadingUnits,
      userUnitsCount: userUnits?.length || 0
    })
    
    // Só buscar quando as unidades do usuário estiverem carregadas
    if (!isLoadingUnits) {
      fetchAgendaLeads()
    }
  }, [selectedUnitIds, currentDate, isLoadingUnits, fetchAgendaLeads])

  // Configurar realtime updates - DEPENDÊNCIAS OTIMIZADAS
  useEffect(() => {
    console.log('🔔 [useAgendaLeads] Configurando realtime subscription')
    
    const channel = supabase
      .channel('agenda-leads-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: 'scheduled_date=not.is.null'
        },
        (payload) => {
          console.log('🔔 [useAgendaLeads] Realtime update recebido:', payload)
          
          // Recarregar dados quando houver mudanças (com debounce implícito via fetchAgendaLeads)
          if (!isLoadingUnits && !isExecutingRef.current) {
            console.log('🔄 [useAgendaLeads] Atualizando dados devido a mudança realtime')
            fetchAgendaLeads()
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔔 [useAgendaLeads] Removendo realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [fetchAgendaLeads, isLoadingUnits])

  return {
    appointments,
    isLoading,
    currentDate,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth,
    refetch: fetchAgendaLeads
  }
}
