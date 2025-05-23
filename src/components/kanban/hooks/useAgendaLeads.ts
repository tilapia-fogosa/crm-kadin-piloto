
import { useState, useEffect } from "react"
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
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  console.log('🎯 [useAgendaLeads] Hook iniciado')
  console.log('📊 [useAgendaLeads] selectedUnitIds recebidos:', selectedUnitIds)
  console.log('🔢 [useAgendaLeads] Quantidade de unidades selecionadas:', selectedUnitIds?.length || 0)
  console.log('📅 [useAgendaLeads] Data atual para busca:', currentDate)

  const fetchAgendaLeads = async () => {
    console.log('🔍 [useAgendaLeads] Iniciando busca de agendamentos')
    
    setIsLoading(true)
    
    try {
      // Definir período do mês atual
      const startOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`
      const endOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`

      console.log('📅 [useAgendaLeads] Período de busca:', {
        início: startOfMonth,
        fim: endOfMonth,
        mês: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      })

      // Estratégia 1: Usar selectedUnitIds se fornecidos
      let unitIdsToFilter: string[] = []
      
      if (selectedUnitIds && selectedUnitIds.length > 0) {
        unitIdsToFilter = selectedUnitIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
        console.log('✅ [useAgendaLeads] Usando selectedUnitIds do Kanban:', unitIdsToFilter)
      }
      
      // Estratégia 2: Fallback para unidades do usuário
      if (unitIdsToFilter.length === 0 && userUnits && userUnits.length > 0) {
        unitIdsToFilter = userUnits.map(unit => unit.unit_id)
        console.log('🔄 [useAgendaLeads] Fallback para unidades do usuário:', unitIdsToFilter)
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
        console.log('🎯 [useAgendaLeads] Aplicando filtro de unidades:', unitIdsToFilter)
      } else {
        console.log('⚠️ [useAgendaLeads] Nenhuma unidade para filtrar - buscando todos os agendamentos')
      }

      const { data: clients, error } = await query

      if (error) {
        console.error('❌ [useAgendaLeads] Erro na query:', error)
        setAppointments([])
        return
      }

      console.log('📊 [useAgendaLeads] Agendamentos encontrados:', clients?.length || 0)
      
      if (clients && clients.length > 0) {
        console.log('📋 [useAgendaLeads] Primeiro agendamento:', clients[0])
        
        // Mapear dados e adicionar nome da unidade
        const transformedAppointments: AgendaLead[] = clients.map(client => {
          const unit = userUnits?.find(u => u.unit_id === client.unit_id)
          return {
            id: client.id,
            name: client.name,
            scheduled_date: client.scheduled_date,
            unit_id: client.unit_id,
            unit_name: unit?.units.name || 'Unidade não encontrada'
          }
        })

        console.log('✅ [useAgendaLeads] Agendamentos processados:', transformedAppointments.length)
        console.log('📅 [useAgendaLeads] Distribuição por dia:', 
          transformedAppointments.reduce((acc, app) => {
            const day = new Date(app.scheduled_date).getDate()
            acc[day] = (acc[day] || 0) + 1
            return acc
          }, {} as Record<number, number>)
        )
        
        setAppointments(transformedAppointments)
      } else {
        console.log('📭 [useAgendaLeads] Nenhum agendamento encontrado')
        setAppointments([])
      }

    } catch (error) {
      console.error('💥 [useAgendaLeads] Erro geral:', error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    console.log('⬅️ [useAgendaLeads] Navegando para o mês anterior')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    console.log('➡️ [useAgendaLeads] Navegando para o próximo mês')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  useEffect(() => {
    console.log('🔄 [useAgendaLeads] useEffect disparado')
    console.log('📊 [useAgendaLeads] Dependências:', { 
      selectedUnitIds, 
      quantidadeUnidades: selectedUnitIds?.length || 0,
      mesAtual: currentDate.getMonth() + 1,
      anoAtual: currentDate.getFullYear(),
      userUnitsCarregadas: !isLoadingUnits
    })
    
    // Só buscar quando as unidades do usuário estiverem carregadas
    if (!isLoadingUnits) {
      fetchAgendaLeads()
    }
  }, [selectedUnitIds, currentDate, isLoadingUnits, userUnits])

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
