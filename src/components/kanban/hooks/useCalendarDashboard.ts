
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useUserUnit } from "./useUserUnit"

interface ScheduledAppointment {
  id: string
  client_name: string
  scheduled_date: string
  status: string
  unit_id: string
  unit_name?: string
}

export function useCalendarDashboard(selectedUnitIds: string[]) {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  const fetchAppointments = async () => {
    console.log('🔍 === INÍCIO DEBUG AGENDA DE LEADS (VERSÃO UNIFICADA) ===')
    console.log('📋 selectedUnitIds recebidos do Kanban:', selectedUnitIds)
    console.log('🔢 Quantidade de unidades vindas do Kanban:', selectedUnitIds?.length || 0)
    console.log('📊 UserUnits do hook:', userUnits?.length || 0)
    
    if (!selectedUnitIds || selectedUnitIds.length === 0) {
      console.log('❌ Não há selectedUnitIds válidos, parando execução')
      setAppointments([])
      return
    }

    setIsLoading(true)
    try {
      // Usar diretamente os selectedUnitIds vindos do Kanban
      let unitIds: string[] = selectedUnitIds.filter(id => id && typeof id === 'string' && id.trim().length > 0)
      
      console.log('🎯 Unit IDs para filtro (vindos do Kanban):', unitIds)
      
      // Verificar se conseguimos ter unit_ids válidos
      if (unitIds.length === 0) {
        console.log('⚠️ ERRO: Nenhum unit_id válido nos selectedUnitIds')
        setAppointments([])
        setIsLoading(false)
        return
      }
      
      // Definir período de busca
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      console.log('📅 Período de busca:', {
        início: startOfMonth.toISOString(),
        fim: endOfMonth.toISOString(),
        mês: currentDate.getMonth() + 1,
        ano: currentDate.getFullYear()
      })
      console.log('🔑 Unit IDs usados na query:', unitIds)

      // Query principal com filtro de unidades vindas do Kanban
      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          scheduled_date,
          unit_id,
          units (
            name
          )
        `)
        .not('scheduled_date', 'is', null)
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startOfMonth.toISOString())
        .lte('scheduled_date', endOfMonth.toISOString())
        .order('scheduled_date', { ascending: true })

      if (error) {
        console.error('❌ Erro na query principal:', error)
        return
      }

      console.log('📊 Agendamentos encontrados na query principal:', clients?.length || 0)
      
      if (clients && clients.length > 0) {
        console.log('📋 Primeiro agendamento:', clients[0])
        
        const transformedAppointments: ScheduledAppointment[] = clients
          .filter(client => client.name && client.scheduled_date)
          .map(client => {
            const unit = client.units as any
            return {
              id: client.id,
              client_name: client.name,
              scheduled_date: client.scheduled_date,
              status: 'agendado',
              unit_id: client.unit_id || '',
              unit_name: unit?.name || 'Unidade não disponível'
            }
          })

        console.log('✅ Agendamentos processados:', transformedAppointments.length)
        setAppointments(transformedAppointments)
      } else {
        console.log('📭 Nenhum agendamento encontrado para as unidades e período especificados')
        
        // Debug para verificar se existem agendamentos sem filtro de unidade
        const { data: debugClients } = await supabase
          .from('clients')
          .select('id, name, scheduled_date, unit_id')
          .not('scheduled_date', 'is', null)
          .eq('active', true)
          .gte('scheduled_date', startOfMonth.toISOString())
          .lte('scheduled_date', endOfMonth.toISOString())

        console.log('🔍 Debug - agendamentos sem filtro de unidade:', debugClients?.length || 0)
        if (debugClients && debugClients.length > 0) {
          const debugUnitIds = [...new Set(debugClients.map(c => c.unit_id))]
          console.log('🔍 Debug - unit_ids encontrados nos agendamentos:', debugUnitIds)
          console.log('🔍 Debug - unit_ids que estamos filtrando (Kanban):', unitIds)
        }
        
        setAppointments([])
      }

      console.log('🏁 === FIM DEBUG AGENDA DE LEADS (VERSÃO UNIFICADA) ===')
    } catch (error) {
      console.error('💥 Erro geral em fetchAppointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    console.log('⬅️ Navegando para o mês anterior')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    console.log('➡️ Navegando para o próximo mês')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleReschedule = (clientId: string, clientName: string) => {
    console.log('📅 Abrindo dialog de reagendamento para:', clientName)
    setSelectedClientId(clientId)
    setSelectedClientName(clientName)
    setIsReschedulingDialogOpen(true)
  }

  useEffect(() => {
    console.log('🔄 useEffect disparado - buscando agendamentos')
    console.log('📊 Estado das dependências:', { 
      selectedUnitIds, 
      quantidadeUnidades: selectedUnitIds?.length || 0,
      mesAtual: currentDate.getMonth() + 1,
      anoAtual: currentDate.getFullYear()
    })
    
    fetchAppointments()
  }, [selectedUnitIds, currentDate])

  return {
    appointments,
    isOpen,
    setIsOpen,
    isLoading,
    currentDate,
    isReschedulingDialogOpen,
    setIsReschedulingDialogOpen,
    selectedClientId,
    selectedClientName,
    userUnits,
    isLoadingUnits,
    handlePreviousMonth,
    handleNextMonth,
    handleReschedule,
    scheduledAppointments: appointments,
    isLoadingAppointments: isLoading,
    refetch: fetchAppointments
  }
}
