
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

export function useCalendarDashboard() {
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isReschedulingDialogOpen, setIsReschedulingDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientName, setSelectedClientName] = useState<string>("")
  const [selectedCalendarUnitIds, setSelectedCalendarUnitIds] = useState<string[]>([])
  
  const { data: userUnits, isLoading: isLoadingUnits } = useUserUnit()

  const fetchAppointments = async () => {
    if (!userUnits || userUnits.length === 0) {
      console.log('❌ Não há userUnits disponível, parando execução')
      return
    }

    console.log('🔍 === INÍCIO DEBUG AGENDA DE LEADS ===')
    console.log('📋 UserUnits recebido:', userUnits)
    console.log('🔢 Quantidade de unidades:', userUnits.length)
    
    setIsLoading(true)
    try {
      // Extrair unit_ids usando apenas a propriedade correta
      let unitIds: string[] = []
      
      if (selectedCalendarUnitIds.length > 0 && !selectedCalendarUnitIds.includes('todos')) {
        unitIds = selectedCalendarUnitIds
        console.log('✅ Usando unidades selecionadas manualmente:', unitIds)
      } else {
        // Extrair unit_ids usando apenas a propriedade unit_id que sabemos que existe
        unitIds = userUnits
          .map(u => u.unit_id)
          .filter(id => id && typeof id === 'string' && id.trim().length > 0)
        
        console.log('🎯 Unit IDs extraídos:', unitIds)
        
        // Debug detalhado de cada unidade
        userUnits.forEach((unit, index) => {
          console.log(`📍 Unidade ${index + 1}:`, {
            unit_id: unit.unit_id,
            units_id: unit.units?.id,
            units_name: unit.units?.name
          })
        })
      }
      
      // Verificar se conseguimos extrair unit_ids válidos
      if (unitIds.length === 0) {
        console.log('⚠️ ERRO: Nenhum unit_id válido extraído')
        console.log('📊 Tentando buscar agendamentos sem filtro como fallback')
        
        // Fallback: buscar todos os agendamentos do período
        const { data: fallbackClients, error: fallbackError } = await supabase
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
          .gte('scheduled_date', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
          .lte('scheduled_date', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString())
          .order('scheduled_date', { ascending: true })

        if (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError)
          return
        }

        console.log('🔄 Fallback executado - agendamentos encontrados:', fallbackClients?.length || 0)
        
        if (fallbackClients && fallbackClients.length > 0) {
          const transformedAppointments: ScheduledAppointment[] = fallbackClients
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

          console.log('✅ Agendamentos do fallback processados:', transformedAppointments.length)
          setAppointments(transformedAppointments)
        } else {
          console.log('📭 Nenhum agendamento encontrado no fallback')
          setAppointments([])
        }
        
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

      // Query principal com filtro de unidades
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
        
        // Verificar se existem agendamentos sem filtro de unidade
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
          console.log('🔍 Debug - unit_ids que estamos filtrando:', unitIds)
        }
        
        setAppointments([])
      }

      console.log('🏁 === FIM DEBUG AGENDA DE LEADS ===')
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
      temUnidades: userUnits && userUnits.length > 0, 
      quantidadeUnidades: userUnits?.length || 0,
      unidadesSelecionadas: selectedCalendarUnitIds,
      mesAtual: currentDate.getMonth() + 1,
      anoAtual: currentDate.getFullYear()
    })
    
    fetchAppointments()
  }, [userUnits, currentDate, selectedCalendarUnitIds])

  // Inicializar unidades selecionadas quando userUnits carregarem
  useEffect(() => {
    if (userUnits && userUnits.length > 0 && selectedCalendarUnitIds.length === 0) {
      console.log('🚀 Inicializando unidades selecionadas')
      
      // Extrair unit_ids usando apenas a propriedade correta
      const unitIds = userUnits
        .map(u => u.unit_id)
        .filter(id => id && typeof id === 'string' && id.trim().length > 0)
      
      console.log('🎯 Unit IDs para inicialização:', unitIds)
      
      if (unitIds.length > 0) {
        setSelectedCalendarUnitIds(unitIds)
        console.log('✅ Unidades inicializadas com sucesso')
      } else {
        console.log('⚠️ Não foi possível extrair unit_ids válidos, usando "todos"')
        setSelectedCalendarUnitIds(['todos'])
      }
    }
  }, [userUnits, selectedCalendarUnitIds.length])

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
    selectedCalendarUnitIds,
    setSelectedCalendarUnitIds,
    handlePreviousMonth,
    handleNextMonth,
    handleReschedule,
    scheduledAppointments: appointments,
    isLoadingAppointments: isLoading,
    refetch: fetchAppointments
  }
}
